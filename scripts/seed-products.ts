import { FieldValue } from "firebase-admin/firestore";
import { SEED_PRODUCTS } from "../src/data/catalog";
import { COLLECTIONS, db } from "../src/lib/firebaseAdmin";
import { loadLocalEnv } from "./load-env";

loadLocalEnv();

async function main() {
    const col = db().collection(COLLECTIONS.products);
    for (const product of SEED_PRODUCTS) {
        const existing = await col.where("slug", "==", product.slug).limit(1).get();
        const payload = {
            ...product,
            active: true,
            updatedAt: FieldValue.serverTimestamp()
        };
        if (existing.empty) {
            await col.add({ ...payload, createdAt: FieldValue.serverTimestamp() });
            console.log("created", product.slug);
        } else {
            await existing.docs[0].ref.set(payload, { merge: true });
            console.log("updated", product.slug);
        }
    }
    console.log("Seed complete.");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
