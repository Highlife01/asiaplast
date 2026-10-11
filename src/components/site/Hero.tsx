import type { Dict } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";
import HeroSlider from "./HeroSlider";

export default function Hero({ dict, locale }: { dict: Dict; locale: Locale }) {
    return (
        <HeroSlider
            locale={locale}
            labels={{
                ctaQuote: dict.site.ctaQuote,
                ctaProducts: dict.site.ctaProducts,
                whatsappDesk: "WhatsApp Export Desk"
            }}
        />
    );
}
