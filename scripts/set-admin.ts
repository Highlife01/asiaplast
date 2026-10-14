import { adminAuth, db, COLLECTIONS } from "../src/lib/firebaseAdmin";
import { loadLocalEnv } from "./load-env";

loadLocalEnv();

async function main() {
    const email = (process.argv[2] || "").trim().toLowerCase();
    if (!email) {
        console.error("Usage: npm run admin:set -- user@example.com");
        process.exit(1);
    }
    const user = await adminAuth().getUserByEmail(email);
    const existingClaims = user.customClaims || {};
    const existingRoles = Array.isArray(existingClaims.roles) ? existingClaims.roles.map(String) : [];
    const isSuper = email === "cebrailkara@gmail.com" || process.argv.includes("--super");
    const nextRoles = Array.from(new Set([...existingRoles, "admin", ...(isSuper ? ["superadmin"] : [])]));

    await adminAuth().setCustomUserClaims(user.uid, {
        ...existingClaims,
        admin: true,
        asiaplastAdmin: true,
        superadmin: isSuper,
        roles: nextRoles
    });

    await db()
        .collection(COLLECTIONS.admins)
        .doc(user.uid)
        .set(
            {
                uid: user.uid,
                email: user.email || email,
                displayName: user.displayName || (isSuper ? "Super Admin" : "Admin"),
                roles: nextRoles,
                admin: true,
                asiaplastAdmin: true,
                disabled: false,
                updatedAt: new Date().toISOString()
            },
            { merge: true }
        );

    console.log(`${isSuper ? "Superadmin" : "Admin"} claim & Firestore registry set for ${email} (${user.uid}).`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
