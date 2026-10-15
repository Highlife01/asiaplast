// Windows non-admin symlink fallback shim for Next.js standalone + Firebase Frameworks deploy
delete process.env.NODE_OPTIONS;
process.env.FIREBASE_FUNCTIONS_DISCOVERY_OUTPUT_PATH = "true";
if (!process.env.FUNCTIONS_DISCOVERY_TIMEOUT) {
    process.env.FUNCTIONS_DISCOVERY_TIMEOUT = "60";
}
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");

const origSymlink = fs.symlink.bind(fs);
const origSymlinkSync = fs.symlinkSync.bind(fs);
const origPromisesSymlink = fsp.symlink.bind(fsp);

function resolveTarget(target, linkPath) {
    const strTarget = String(target);
    if (path.isAbsolute(strTarget)) return strTarget;
    return path.resolve(path.dirname(String(linkPath)), strTarget);
}

function fallbackCopySync(target, linkPath) {
    const resolved = resolveTarget(target, linkPath);
    const stat = fs.statSync(resolved);
    if (stat.isDirectory()) {
        fs.cpSync(resolved, linkPath, { recursive: true, dereference: true });
        return;
    }
    fs.copyFileSync(resolved, linkPath);
}

fs.symlinkSync = function patchedSymlinkSync(target, linkPath, type) {
    if (String(linkPath).includes(".firebase")) {
        return fallbackCopySync(target, linkPath);
    }
    try {
        return origSymlinkSync(target, linkPath, type);
    } catch (err) {
        if (err && (err.code === "EPERM" || err.code === "ENOSYS")) {
            return fallbackCopySync(target, linkPath);
        }
        throw err;
    }
};

fs.symlink = function patchedSymlink(target, linkPath, typeOrCb, maybeCb) {
    const cb = typeof typeOrCb === "function" ? typeOrCb : maybeCb;
    const type = typeof typeOrCb === "function" ? undefined : typeOrCb;
    if (String(linkPath).includes(".firebase")) {
        try {
            fallbackCopySync(target, linkPath);
            cb(null);
        } catch (copyErr) {
            cb(copyErr);
        }
        return;
    }
    origSymlink(target, linkPath, type, (err) => {
        if (err && (err.code === "EPERM" || err.code === "ENOSYS")) {
            try {
                fallbackCopySync(target, linkPath);
                cb(null);
            } catch (copyErr) {
                cb(copyErr);
            }
            return;
        }
        cb(err);
    });
};

fsp.symlink = async function patchedPromisesSymlink(target, linkPath, type) {
    if (String(linkPath).includes(".firebase")) {
        fallbackCopySync(target, linkPath);
        return;
    }
    try {
        return await origPromisesSymlink(target, linkPath, type);
    } catch (err) {
        if (err && (err.code === "EPERM" || err.code === "ENOSYS")) {
            fallbackCopySync(target, linkPath);
            return;
        }
        throw err;
    }
};
