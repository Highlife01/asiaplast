import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const EXPECTED_PROJECT = "ajansonline";
const KEEP_RELEASES = 5;
const API_BASE = "https://firebasehosting.googleapis.com/v1beta1";

function getVerifiedProject() {
    const rcPath = path.join(process.cwd(), ".firebaserc");
    if (!fs.existsSync(rcPath)) {
        throw new Error(".firebaserc bulunamadı. Hedef proje doğrulanamadığı için işlem durduruldu.");
    }
    const rc = JSON.parse(fs.readFileSync(rcPath, "utf8"));
    const def = rc?.projects?.default;
    if (def !== EXPECTED_PROJECT) {
        throw new Error(`Hedef proje uyuşmazlığı: beklenen '${EXPECTED_PROJECT}', bulunan '${def}'. İşlem durduruldu.`);
    }
    return def;
}

function getAccessToken(projectId) {
    const cfgPath = path.join(os.homedir(), ".config", "configstore", "firebase-tools.json");
    if (!fs.existsSync(cfgPath)) {
        throw new Error("Firebase CLI oturum dosyası bulunamadı.");
    }
    let cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
    const expiresAt = Number(cfg?.tokens?.expires_at || 0);
    if (!cfg?.tokens?.access_token || expiresAt < Date.now() + 60_000) {
        execFileSync(
            process.platform === "win32" ? "firebase.cmd" : "firebase",
            ["hosting:sites:list", "--project", projectId, "--json"],
            {
                stdio: "ignore",
                shell: process.platform === "win32"
            }
        );
        cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
    }
    const token = cfg?.tokens?.access_token;
    if (!token) throw new Error("Firebase erişim belirteci (access_token) alınamadı.");
    return token;
}

async function apiRequest(token, method, url, body) {
    const res = await fetch(url, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: body ? JSON.stringify(body) : undefined
    });
    const text = await res.text();
    let json = null;
    try {
        json = text ? JSON.parse(text) : null;
    } catch {
        json = { raw: text };
    }
    if (!res.ok) {
        const msg = json?.error?.message || text || `HTTP ${res.status}`;
        const err = new Error(msg);
        err.status = res.status;
        throw err;
    }
    return json;
}

async function listAllPaginated(token, baseUrl, arrayKey) {
    const items = [];
    let pageToken = "";
    do {
        const sep = baseUrl.includes("?") ? "&" : "?";
        const url = `${baseUrl}${sep}pageSize=100${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`;
        const data = await apiRequest(token, "GET", url);
        if (Array.isArray(data?.[arrayKey])) {
            items.push(...data[arrayKey]);
        }
        pageToken = data?.nextPageToken || "";
    } while (pageToken);
    return items;
}

function formatBytes(bytes) {
    const num = Number(bytes || 0);
    if (!num) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let idx = 0;
    let val = num;
    while (val >= 1024 && idx < units.length - 1) {
        val /= 1024;
        idx++;
    }
    return `${val.toFixed(2)} ${units[idx]}`;
}

async function main() {
    const args = process.argv.slice(2);
    const apply = args.includes("--apply");
    const siteFilterArg = args.find((a) => a.startsWith("--site="));
    const siteFilter = siteFilterArg ? siteFilterArg.split("=")[1] : null;

    const projectId = getVerifiedProject();
    const token = getAccessToken(projectId);

    console.log(`=== FIREBASE HOSTING SÜRÜM TEMİZLİĞİ (${apply ? "UYGULAMA MODU" : "ÖN İZLEME / DRY-RUN"}) ===`);
    console.log(`Doğrulanan Proje: ${projectId}`);
    console.log(`Korunacak Release Sayısı (Kanal Başına): ${KEEP_RELEASES} + Aktif Yayındaki Sürüm\n`);

    const allSites = await listAllPaginated(token, `${API_BASE}/projects/${projectId}/sites`, "sites");
    const sites = siteFilter ? allSites.filter((s) => s.name.endsWith(`/sites/${siteFilter}`)) : allSites;

    if (sites.length === 0) {
        throw new Error("Hiçbir Hosting sitesi bulunamadı.");
    }

    const summary = {
        project: projectId,
        mode: apply ? "apply" : "dry-run",
        sitesChecked: sites.length,
        channelsChecked: 0,
        retentionConfiguredChannels: 0,
        retainedVersionsCount: 0,
        candidateDeleteCount: 0,
        deletedCount: 0,
        failedDeleteCount: 0,
        bytesBefore: 0,
        bytesFreed: 0,
        bytesRetained: 0,
        errors: [],
        siteReports: []
    };

    for (const site of sites) {
        const siteId = site.name.split("/").pop();
        console.log(`------------------------------------------------------------`);
        console.log(`Site: ${siteId} (${site.defaultUrl})`);

        const channels = await listAllPaginated(
            token,
            `${API_BASE}/projects/${projectId}/sites/${siteId}/channels`,
            "channels"
        );
        summary.channelsChecked += channels.length;

        const protectedVersions = new Map();

        for (const ch of channels) {
            const channelId = ch.name.split("/").pop();
            const currentRetention = ch.retainedReleaseCount ?? "varsayılan";
            let updatedRetention = currentRetention;

            if (apply && ch.retainedReleaseCount !== KEEP_RELEASES) {
                try {
                    const patched = await apiRequest(
                        token,
                        "PATCH",
                        `${API_BASE}/projects/${projectId}/sites/${siteId}/channels/${channelId}?updateMask=retained_release_count`,
                        { retainedReleaseCount: KEEP_RELEASES }
                    );
                    updatedRetention = patched.retainedReleaseCount ?? KEEP_RELEASES;
                    summary.retentionConfiguredChannels++;
                } catch (err) {
                    summary.errors.push(`Kanal saklama ayarı güncellenemedi (${siteId}/${channelId}): ${err.message}`);
                }
            }

            const activeVersionName = ch?.release?.version?.name;
            if (activeVersionName) {
                if (!protectedVersions.has(activeVersionName)) protectedVersions.set(activeVersionName, new Set());
                protectedVersions.get(activeVersionName).add(`aktif-kanal:${channelId}`);
            }

            const releases = await listAllPaginated(
                token,
                `${API_BASE}/projects/${projectId}/sites/${siteId}/channels/${channelId}/releases`,
                "releases"
            );

            releases.sort((a, b) => {
                const ta = Date.parse(a.releaseTime || "1970-01-01T00:00:00Z");
                const tb = Date.parse(b.releaseTime || "1970-01-01T00:00:00Z");
                return tb - ta;
            });

            const newestReleases = releases.slice(0, KEEP_RELEASES);
            newestReleases.forEach((rel, idx) => {
                const vName = rel?.version?.name;
                if (vName) {
                    if (!protectedVersions.has(vName)) protectedVersions.set(vName, new Set());
                    protectedVersions.get(vName).add(`kanal:${channelId}:son-${idx + 1} (${rel.releaseTime})`);
                }
            });

            console.log(
                `  Kanal: ${channelId} | Toplam Release: ${releases.length} | Saklama Ayarı: ${currentRetention} -> ${updatedRetention} | Aktif Sürüm: ${
                    activeVersionName ? activeVersionName.split("/").pop() : "Yok"
                }`
            );
        }

        const versions = await listAllPaginated(
            token,
            `${API_BASE}/projects/${projectId}/sites/${siteId}/versions`,
            "versions"
        );
        versions.sort((a, b) => {
            const ta = Date.parse(a.createTime || "1970-01-01T00:00:00Z");
            const tb = Date.parse(b.createTime || "1970-01-01T00:00:00Z");
            return tb - ta;
        });

        const retainedList = [];
        const deleteCandidates = [];

        for (const ver of versions) {
            const vName = ver.name;
            const vId = vName.split("/").pop();
            const vBytes = Number(ver.versionBytes || 0);
            const status = ver.status || "UNKNOWN";

            if (status !== "DELETED") {
                summary.bytesBefore += vBytes;
            }

            if (protectedVersions.has(vName) || status === "CREATED") {
                const reasons = protectedVersions.has(vName)
                    ? Array.from(protectedVersions.get(vName)).join(", ")
                    : "devam-eden-deploy (CREATED)";
                retainedList.push({ id: vId, name: vName, status, createTime: ver.createTime, bytes: vBytes, reasons });
                summary.retainedVersionsCount++;
                if (status !== "DELETED") summary.bytesRetained += vBytes;
            } else if (status !== "DELETED") {
                deleteCandidates.push({ id: vId, name: vName, status, createTime: ver.createTime, bytes: vBytes });
                summary.candidateDeleteCount++;
            }
        }

        console.log(`  Korunan Sürümler (${retainedList.length}):`);
        for (const r of retainedList) {
            console.log(
                `    [KORU]  ${r.id} | ${r.status} | ${r.createTime || "-"} | ${formatBytes(r.bytes)} | Neden: ${r.reasons}`
            );
        }

        console.log(`  Silinecek Eski Sürümler (${deleteCandidates.length}):`);
        for (const d of deleteCandidates) {
            console.log(`    [SİL]   ${d.id} | ${d.status} | ${d.createTime || "-"} | ${formatBytes(d.bytes)}`);
        }

        let siteDeleted = 0;
        let siteFreedBytes = 0;

        if (apply && deleteCandidates.length > 0) {
            for (const d of deleteCandidates) {
                if (protectedVersions.has(d.name)) continue;
                try {
                    await apiRequest(token, "DELETE", `${API_BASE}/${d.name}`);
                    siteDeleted++;
                    summary.deletedCount++;
                    siteFreedBytes += d.bytes;
                    summary.bytesFreed += d.bytes;
                    console.log(`    -> Silindi: ${d.id} (${formatBytes(d.bytes)})`);
                } catch (err) {
                    summary.failedDeleteCount++;
                    const errMsg = `${siteId}/${d.id} silinemedi: ${err.message}`;
                    summary.errors.push(errMsg);
                    console.error(`    -> [HATA] ${errMsg}`);
                }
            }
        }

        let liveStatus = null;
        try {
            const liveResp = await fetch(site.defaultUrl, { method: "HEAD", redirect: "follow" });
            liveStatus = liveResp.status;
        } catch (err) {
            liveStatus = `ERR: ${err.message}`;
        }

        console.log(`  Canlı Site Kontrolü (${site.defaultUrl}): HTTP ${liveStatus}`);

        summary.siteReports.push({
            siteId,
            defaultUrl: site.defaultUrl,
            liveStatus,
            retainedCount: retainedList.length,
            candidateDeleteCount: deleteCandidates.length,
            deletedCount: siteDeleted,
            freedBytes: siteFreedBytes
        });
    }

    console.log(`\n============================================================`);
    console.log(`ÖZET RAPOR:`);
    console.log(`  Mod: ${summary.mode}`);
    console.log(`  Kontrol Edilen Site Sayısı: ${summary.sitesChecked}`);
    console.log(`  Kontrol Edilen Kanal Sayısı: ${summary.channelsChecked}`);
    console.log(`  Yerleşik Saklama Ayarı (5) Güncellenen Kanal: ${summary.retentionConfiguredChannels}`);
    console.log(`  Korunan Sürüm Sayısı: ${summary.retainedVersionsCount} (${formatBytes(summary.bytesRetained)})`);
    console.log(`  Silinmeye Aday Eski Sürüm Sayısı: ${summary.candidateDeleteCount}`);
    console.log(`  Başarıyla Silinen Sürüm Sayısı: ${summary.deletedCount}`);
    console.log(`  Başarısız Silme Sayısı: ${summary.failedDeleteCount}`);
    console.log(`  Önceki Toplam Version Boyutu: ${formatBytes(summary.bytesBefore)}`);
    console.log(`  Boşaltılan Version Boyutu: ${formatBytes(summary.bytesFreed)}`);
    console.log(`  Kalan Version Boyutu: ${formatBytes(summary.bytesRetained)}`);
    console.log(
        `  Not: Firebase Console depolama göstergesinin güncellenmesi arka plan toplama işlemleri nedeniyle birkaç saat gecikebilir.`
    );

    if (summary.errors.length > 0) {
        console.error(`\nKarşılaşılan Hatalar (${summary.errors.length}):`);
        for (const e of summary.errors) console.error(`  - ${e}`);
        process.exitCode = 1;
    }
}

main().catch((err) => {
    console.error("Kritik Hata:", err.message);
    process.exit(1);
});
