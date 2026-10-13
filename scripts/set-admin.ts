import { adminAuth } from "../src/lib/firebaseAdmin";
import { loadLocalEnv } from "./load-env";

loadLocalEnv();

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error("Usage: npm run admin:set -- user@example.com [--super]");
        process.exit(1);
    }
    const user = await adminAuth().getUserByEmail(email);
    const isSuper = process.argv.includes("--super");
    await adminAuth().setCustomUserClaims(user.uid, {
        admin: true,
        superadmin: isSuper,
        roles: isSuper ? ["admin", "superadmin"] : ["admin"]
    });
    console.log(`${isSuper ? "Superadmin" : "Admin"} claim set for ${email} (${user.uid}).`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
