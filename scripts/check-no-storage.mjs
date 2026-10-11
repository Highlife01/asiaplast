import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

const root = join(process.cwd(), "src");
const hits = [];

function walk(dir) {
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) {
            walk(p);
            continue;
        }
        if (!/\.(ts|tsx|js|mjs)$/.test(name)) continue;
        const lines = readFileSync(p, "utf8").split(/\r?\n/);
        lines.forEach((line, i) => {
            const trimmed = line.trim();
            if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) return;
            if (/\b(window\.)?(localStorage|sessionStorage|indexedDB)\s*[.[]/.test(line) || /\bindexedDB\.open\b/.test(line)) {
                hits.push(`${p}:${i + 1}: ${trimmed}`);
            }
        });
    }
}

walk(root);
if (hits.length) {
    console.error("Browser storage APIs are not allowed:\n" + hits.join("\n"));
    process.exit(1);
}
console.log("OK — no localStorage / sessionStorage / indexedDB in src.");
