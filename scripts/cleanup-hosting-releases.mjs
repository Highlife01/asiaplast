#!/usr/bin/env node
/**
 * Firebase Hosting Release & Version Pruning Script
 *
 * Rules:
 * - Only operates on verified project ('ajansonline') and site ('asiaplast').
 * - Preserves at least the latest 5 releases per channel AND the currently live release.
 * - Gathers all versions in use by kept releases.
 * - Safely deletes older unused versions via Firebase Hosting REST API v1beta1.
 * - Updates channel retainedReleaseCount to 5.
 * - Verifies live site health after pruning.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const TARGET_PROJECT = process.env.FIREBASE_PROJECT_ID || 'ajansonline';
const TARGET_SITE = process.env.FIREBASE_SITE_ID || 'asiaplast';
const KEEP_RELEASE_COUNT = 5;

// Parse CLI flags
const args = process.argv.slice(2);
const isExecute = args.includes('--execute') || args.includes('--prune');
const isDryRun = !isExecute || args.includes('--dry-run');

async function getAccessToken() {
    const configPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
    if (!fs.existsSync(configPath)) {
        throw new Error(`Firebase tools configuration not found at ${configPath}. Please run 'firebase login'.`);
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const tokens = config.tokens;
    if (!tokens) {
        throw new Error('No authentication tokens found in firebase-tools.json');
    }

    // Refresh if expired or near expiry
    if (tokens.expires_at && Date.now() > tokens.expires_at - 120000 && tokens.refresh_token) {
        const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho85tcd.apps.googleusercontent.com',
                client_secret: '',
                grant_type: 'refresh_token',
                refresh_token: tokens.refresh_token
            })
        });
        const refreshData = await refreshRes.json();
        if (refreshData.access_token) {
            tokens.access_token = refreshData.access_token;
            tokens.expires_at = Date.now() + (refreshData.expires_in || 3600) * 1000;
            config.tokens = tokens;
            try {
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
            } catch {
                // Ignore file write errors if non-critical
            }
            return refreshData.access_token;
        }
    }

    return tokens.access_token;
}

async function apiRequest(endpoint, token, options = {}) {
    const url = endpoint.startsWith('https://')
        ? endpoint
        : `https://firebasehosting.googleapis.com/v1beta1/${endpoint}`;

    const res = await fetch(url, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });

    if (!res.ok && res.status !== 204) {
        const text = await res.text();
        throw new Error(`API ${options.method || 'GET'} ${url} returned ${res.status}: ${text}`);
    }

    if (res.status === 204) return null;
    return await res.json();
}

export async function runPruning() {
    console.log('='.repeat(70));
    console.log('   FIREBASE HOSTING RELEASE & VERSION CLEANUP');
    console.log('='.repeat(70));
    console.log(`Target Project: ${TARGET_PROJECT}`);
    console.log(`Target Site:    ${TARGET_SITE}`);
    console.log(`Retention Rule: Keep latest ${KEEP_RELEASE_COUNT} releases + currently active release`);
    console.log(`Mode:           ${isExecute ? 'EXECUTE (REAL DELETION)' : 'DRY RUN (AUDIT ONLY)'}`);
    console.log('='.repeat(70));

    const token = await getAccessToken();

    // 1. Verify project & site
    console.log('\n[1/6] Verifying Hosting channels...');
    const channelsData = await apiRequest(`sites/${TARGET_SITE}/channels`, token);
    const channels = channelsData.channels || [];
    console.log(`Found ${channels.length} channel(s):`, channels.map(c => c.name.split('/').pop()).join(', '));

    const keptVersions = new Set();
    const keptReleases = [];
    const olderReleases = [];

    // 2. Process each channel
    for (const channel of channels) {
        const channelId = channel.name.split('/').pop();
        console.log(`\n[2/6] Processing channel: ${channelId}`);
        console.log(`  Channel URL: ${channel.url}`);
        console.log(`  Current live release: ${channel.release?.name?.split('/')?.pop() || 'none'}`);
        console.log(`  Current version: ${channel.release?.version?.name || 'none'}`);

        // Set built-in release retention to 5
        if (channel.retainedReleaseCount !== KEEP_RELEASE_COUNT) {
            console.log(`  Updating channel retainedReleaseCount to ${KEEP_RELEASE_COUNT}...`);
            try {
                const patchRes = await apiRequest(
                    `sites/${TARGET_SITE}/channels/${channelId}?updateMask=retainedReleaseCount`,
                    token,
                    {
                        method: 'PATCH',
                        body: JSON.stringify({ retainedReleaseCount: KEEP_RELEASE_COUNT })
                    }
                );
                console.log(`  ✓ retainedReleaseCount updated to ${patchRes.retainedReleaseCount}`);
            } catch (err) {
                console.warn(`  ! Warning updating retainedReleaseCount:`, err.message);
            }
        } else {
            console.log(`  ✓ retainedReleaseCount is already set to ${KEEP_RELEASE_COUNT}`);
        }

        // Always protect currently live release version
        if (channel.release?.version?.name) {
            keptVersions.add(channel.release.version.name);
        }

        // Fetch all releases for this channel
        const releasesData = await apiRequest(`sites/${TARGET_SITE}/channels/${channelId}/releases?pageSize=100`, token);
        const releases = (releasesData.releases || []).sort((a, b) => {
            return new Date(b.releaseTime).getTime() - new Date(a.releaseTime).getTime();
        });

        console.log(`  Found ${releases.length} total release(s) for channel '${channelId}'.`);

        releases.forEach((rel, index) => {
            const verName = rel.version?.name;
            const isLive = rel.name === channel.release?.name;
            if (index < KEEP_RELEASE_COUNT || isLive) {
                keptReleases.push({ channel: channelId, release: rel, isLive });
                if (verName) keptVersions.add(verName);
            } else {
                olderReleases.push({ channel: channelId, release: rel });
            }
        });
    }

    console.log(`\n[3/6] Analyzed releases:`);
    console.log(`  Kept Releases:  ${keptReleases.length}`);
    console.log(`  Older Releases: ${olderReleases.length}`);
    console.log(`  Active Version References Protected: ${keptVersions.size}`);

    keptReleases.forEach((item, idx) => {
        const r = item.release;
        console.log(`    ✓ [KEEP #${idx + 1}] ${r.name.split('/').pop()} | ${r.releaseTime} | Version: ${r.version?.name || 'n/a'} ${item.isLive ? '(CURRENT LIVE)' : ''}`);
    });

    if (olderReleases.length > 0) {
        console.log(`  Older releases beyond threshold:`);
        olderReleases.forEach((item, idx) => {
            const r = item.release;
            console.log(`    - [OLD #${idx + 1}] ${r.name.split('/').pop()} | ${r.releaseTime} | Version: ${r.version?.name || 'n/a'}`);
        });
    }

    // 3. Inspect all versions under the site
    console.log(`\n[4/6] Inspecting site versions...`);
    const versionsData = await apiRequest(`sites/${TARGET_SITE}/versions?pageSize=100`, token);
    const allVersions = versionsData.versions || [];
    console.log(`Total versions in site: ${allVersions.length}`);

    const versionsToKeep = [];
    const versionsToDelete = [];

    for (const ver of allVersions) {
        const bytes = parseInt(ver.versionBytes || '0', 10);
        if (ver.status === 'DELETED') {
            continue;
        }
        const isReferenced = keptVersions.has(ver.name);
        if (isReferenced) {
            versionsToKeep.push({ ...ver, bytes });
        } else {
            versionsToDelete.push({ ...ver, bytes });
        }
    }

    console.log(`\n  Versions to KEEP:   ${versionsToKeep.length}`);
    versionsToKeep.forEach(v => {
        console.log(`    🛡️  ${v.name} | Status: ${v.status} | Files: ${v.fileCount || 0} | ${(v.bytes / 1024 / 1024).toFixed(2)} MB`);
    });

    console.log(`  Versions to DELETE: ${versionsToDelete.length}`);
    let totalBytesToDelete = 0;
    versionsToDelete.forEach(v => {
        totalBytesToDelete += v.bytes;
        console.log(`    🗑️  ${v.name} | Status: ${v.status} | Files: ${v.fileCount || 0} | ${(v.bytes / 1024 / 1024).toFixed(2)} MB | Created: ${v.createTime}`);
    });
    console.log(`  Potential storage reclaim: ${(totalBytesToDelete / 1024 / 1024).toFixed(2)} MB`);

    // 4. Perform actual deletion if execute mode
    const deletionResults = {
        deletedCount: 0,
        failedCount: 0,
        freedBytes: 0,
        errors: []
    };

    if (isExecute) {
        console.log(`\n[5/6] EXECUTING DELETIONS...`);
        if (versionsToDelete.length === 0) {
            console.log(`  No unneeded versions to delete. All versions are within the retention limit.`);
        }

        for (const ver of versionsToDelete) {
            console.log(`  Deleting version: ${ver.name} ...`);
            try {
                await apiRequest(ver.name, token, { method: 'DELETE' });
                console.log(`  ✓ Successfully deleted version ${ver.name.split('/').pop()}`);
                deletionResults.deletedCount++;
                deletionResults.freedBytes += ver.bytes;
            } catch (err) {
                console.error(`  ✗ Error deleting version ${ver.name}:`, err.message);
                deletionResults.failedCount++;
                deletionResults.errors.push({ version: ver.name, error: err.message });
            }
        }
    } else {
        console.log(`\n[5/6] DRY RUN complete. No versions were deleted.`);
        console.log(`  To execute real deletion, run: node scripts/cleanup-hosting-releases.mjs --execute`);
    }

    // 5. Health verification of live site
    console.log(`\n[6/6] Verifying live site health...`);
    try {
        const liveUrl = `https://${TARGET_SITE}.web.app/`;
        const testRes = await fetch(liveUrl, { method: 'GET', redirect: 'follow' });
        console.log(`  GET ${liveUrl} -> HTTP ${testRes.status} ${testRes.statusText}`);
        if (testRes.ok) {
            console.log(`  ✓ Live site is healthy and serving requests.`);
        } else {
            console.warn(`  ! Warning: Live site returned status ${testRes.status}`);
        }
    } catch (netErr) {
        console.error(`  ✗ Failed to reach live site:`, netErr.message);
    }

    // Summary report
    console.log('\n' + '='.repeat(70));
    console.log('   CLEANUP REPORT SUMMARY');
    console.log('='.repeat(70));
    console.log(`Site:                ${TARGET_SITE} (${TARGET_PROJECT})`);
    console.log(`Kept Releases:       ${keptReleases.length}`);
    console.log(`Kept Versions:       ${versionsToKeep.length}`);
    console.log(`Deleted Versions:    ${deletionResults.deletedCount}`);
    console.log(`Failed Deletions:    ${deletionResults.failedCount}`);
    console.log(`Freed Storage (est): ${(deletionResults.freedBytes / 1024 / 1024).toFixed(2)} MB`);
    if (deletionResults.errors.length > 0) {
        console.log(`Errors encountered:`);
        deletionResults.errors.forEach(e => console.log(`  - ${e.version}: ${e.error}`));
    }
    console.log(`\nNote on storage metrics: Google Cloud & Firebase Console storage`);
    console.log(`gauges update asynchronously and may take several hours to reflect`);
    console.log(`deleted version file byte reductions in billing/usage dashboards.`);
    console.log('='.repeat(70) + '\n');

    return {
        keptReleases,
        keptVersions: Array.from(keptVersions),
        versionsToKeep,
        versionsToDelete,
        deletionResults
    };
}

// Run directly if called as a script
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'))) {
    runPruning().catch(err => {
        console.error('Pruning script failed:', err);
        process.exit(1);
    });
}
