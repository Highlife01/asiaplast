import { ensureSeedProductsInFirestore, getCompanySettings } from "../src/lib/repo";
import { loadLocalEnv } from "./load-env";

loadLocalEnv();

async function main() {
    const products = await ensureSeedProductsInFirestore();
    console.log(`Seeded/verified ${products.length} products in Firestore (asiaplast_products).`);
    const settings = await getCompanySettings();
    console.log(`Verified company settings in Firestore (asiaplast_settings/company): ${settings.name} (${settings.email}).`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
