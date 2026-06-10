import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { A4Sheet } from "@/components/a4/A4Sheet";
import { PrintButton } from "@/components/a4/PrintButton";
import { AcademyBadge } from "@/components/brand/AcademyBadge";
import { MarkdownArticle } from "@/components/markdown/MarkdownArticle";
import { getDocs } from "@/lib/content";
import { getDictionary, isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const DOC_REF = "MFA-AG-2026";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.guide.title,
    description:
      locale === "tr"
        ? "Agentic AI Developer müfredatının A4 formatındaki akademik çalışma rehberi — tüm domain'ler, ağırlıklar ve altyapı notlarıyla yazdırılabilir baskı."
        : "The A4 academic study guide for the Agentic AI Developer curriculum — every domain, weight and infrastructure note in a printable edition.",
    alternates: {
      canonical: `/${locale}/guide`,
      languages: {
        en: "/en/guide",
        tr: "/tr/guide",
        "x-default": "/en/guide",
      },
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [dict, docs] = await Promise.all([getDictionary(locale), getDocs(locale)]);
  const totalPages = docs.length + 1;

  return (
    <div className="px-4 py-8">
      {/* Floating toolbar */}
      <div className="print-hidden sticky top-20 z-40 mx-auto mb-8 flex w-full max-w-[210mm] items-center justify-between border border-white/20 bg-black/85 px-5 py-3 backdrop-blur-md">
        <span className="font-mono text-[11px] uppercase tracking-widest text-white/60">
          {dict.guide.title}
        </span>
        <PrintButton label={dict.guide.print} />
      </div>

      {/* Cover sheet */}
      <A4Sheet
        header={{ left: dict.hero.kicker, right: `Doc Ref: ${DOC_REF}` }}
        footer={{
          left: "MasterFabric Academy © 2026",
          right: `${dict.guide.pageWord} 1 / ${totalPages}`,
        }}
      >
        <div className="flex h-full flex-col justify-center gap-10 py-10">
          <AcademyBadge size={96} className="border border-white/15" />
          <div className="space-y-4">
            <h1
              className="text-4xl font-extrabold leading-tight tracking-tight text-white"
              style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
            >
              {dict.hero.title}
            </h1>
            <p className="text-lg font-medium text-white/70">{dict.hero.subtitle}</p>
            <div className="h-1 w-20 bg-white" />
          </div>
          <p className="text-justify text-sm leading-relaxed text-white/55">
            {dict.hero.lead}
          </p>
          <div className="grid grid-cols-3 gap-4 border-t border-white/15 pt-6 text-xs">
            {[
              [dict.hero.publisher, "MasterFabric Academy"],
              [dict.hero.revision, dict.hero.revisionValue],
              [dict.hero.date, dict.hero.dateValue],
            ].map(([label, value]) => (
              <div key={label}>
                <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-white/40">
                  {label}
                </span>
                <span className="mt-1 block font-medium text-white/80">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </A4Sheet>

      {/* One A4 sheet per markdown document */}
      {docs.map((doc, index) => (
        <div key={doc.slug} id={doc.slug} className="scroll-mt-24">
          <A4Sheet
            header={{ left: doc.section, right: DOC_REF }}
            footer={{
              left: "MasterFabric Academy © 2026",
              right: `${dict.guide.pageWord} ${index + 2} / ${totalPages}`,
            }}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
                >
                  {doc.title}
                </h2>
                <div className="flex items-center gap-2">
                  {doc.badge && (
                    <span className="border border-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white">
                      {doc.badge}
                    </span>
                  )}
                  {doc.weight !== undefined && (
                    <span className="border border-white/30 bg-white/5 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-white">
                      {dict.guide.weightWord}: {doc.weight}%
                    </span>
                  )}
                </div>
              </div>

              <MarkdownArticle body={doc.body} />

              {doc.infrastructure && (
                <div className="border border-white/20 bg-white/[0.03] p-4">
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-white">
                    {dict.guide.infrastructure}
                  </span>
                  <p className="mt-2 text-justify text-xs leading-relaxed text-white/60">
                    {doc.infrastructure}
                  </p>
                </div>
              )}
            </div>
          </A4Sheet>
        </div>
      ))}
    </div>
  );
}
