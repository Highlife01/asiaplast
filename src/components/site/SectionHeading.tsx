export default function SectionHeading({
    eyebrow,
    title,
    lead,
    center,
    light
}: {
    eyebrow?: string;
    title: string;
    lead?: string;
    center?: boolean;
    light?: boolean;
}) {
    return (
        <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
            {eyebrow && (
                <p className={`chip mb-3 ${light ? "!border-brand-green/40 !bg-white/10 !text-brand-green" : ""}`}>
                    {eyebrow}
                </p>
            )}
            <h2 className={`h2-title ${light ? "!text-white" : ""}`}>{title}</h2>
            {lead && (
                <p className={`mt-4 text-base leading-relaxed ${light ? "text-slate-300" : "text-slate-600"}`}>
                    {lead}
                </p>
            )}
        </div>
    );
}
