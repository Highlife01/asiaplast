import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

export function loadLocalEnv() {
    for (const file of [".env.local", ".env"]) {
        const p = resolve(process.cwd(), file);
        if (!existsSync(p)) continue;
        for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) continue;
            const eq = trimmed.indexOf("=");
            if (eq < 1) continue;
            const key = trimmed.slice(0, eq).trim();
            if (process.env[key]) continue;
            let value = trimmed.slice(eq + 1).trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    }
}
