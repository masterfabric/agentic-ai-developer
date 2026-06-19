import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplySection } from "@/components/apply/ApplySection";
import {
  ChatGptIcon,
  ClaudeIcon,
  CursorIcon,
  GeminiIcon,
} from "@/components/brand/AiProviderIcons";
import { MasterFabricLogo } from "@/components/brand/MasterFabricLogo";
import { CertificateSection } from "@/components/certificate/CertificateSection";
import { WeightBars } from "@/components/charts/WeightBars";
import { EvolutionSection } from "@/components/evolution/EvolutionSection";
import { EnterpriseCard } from "@/components/hero/EnterpriseCard";
import { OpsHighlights } from "@/components/hero/OpsHighlights";
import { TechLead } from "@/components/hero/TechLead";
import { InstructorCard } from "@/components/instructor/InstructorCard";
import { getDocs, getDomainWeights } from "@/lib/content";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getApplicationPromptTemplate } from "@/lib/prompts";

export const dynamic = "force-dynamic";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [dict, docs, weights, promptTemplate] = await Promise.all([
    getDictionary(locale),
    getDocs(locale),
    getDomainWeights(locale),
    getApplicationPromptTemplate(locale),
  ]);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
          <MasterFabricLogo className="absolute -right-24 -top-24 h-[480px] w-[600px] text-white" />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-white/45">
            {dict.hero.kicker}
          </span>
          <h1
            className="mt-6 max-w-3xl text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            {dict.hero.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-medium text-white/70">
            {dict.hero.subtitle}
          </p>

          <InstructorCard copy={dict.hero.instructor} />

          <div className="mt-6 h-1 w-20 bg-white" />
          <TechLead text={dict.hero.lead} locale={locale} />

          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { name: "Cursor", Icon: CursorIcon },
              { name: "Anthropic", Icon: ClaudeIcon },
              { name: "OpenAI", Icon: ChatGptIcon },
              { name: "Gemini", Icon: GeminiIcon },
            ].map(({ name, Icon }) => (
              <div
                key={name}
                title={name}
                className="flex aspect-square w-16 items-center justify-center border border-white/20 bg-white/[0.03] transition hover:border-white/50 sm:w-20"
              >
                <Icon className="h-7 w-7 text-white sm:h-8 sm:w-8" />
                <span className="sr-only">{name}</span>
              </div>
            ))}
          </div>

          <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-white/75">
            {dict.hero.leadExtra}
          </p>

          <OpsHighlights copy={dict.hero.ops} />

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={`/${locale}/guide`}
              className="border border-white bg-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-black transition hover:bg-black hover:text-white"
            >
              {dict.hero.ctaGuide}
            </Link>
            <Link
              href={`/${locale}#why-agentic`}
              className="border border-white/40 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white transition hover:border-white hover:bg-white hover:text-black"
            >
              {dict.hero.ctaWhy}
            </Link>
            <Link href={`/${locale}#apply`} className="rgb-button">
              {/* px/py tuned so total height matches the 1px-bordered siblings */}
              <span className="rgb-button-inner block bg-black px-[23px] py-[11px] text-center font-mono text-xs font-bold uppercase tracking-widest text-white">
                {dict.hero.ctaApply}
              </span>
            </Link>
          </div>

          <EnterpriseCard copy={dict.hero.enterprise} />

          <div className="mt-16 grid max-w-2xl grid-cols-1 gap-6 border-t border-white/15 pt-8 sm:grid-cols-3">
            {[
              [dict.hero.publisher, "MasterFabric Academy"],
              [dict.hero.revision, dict.hero.revisionValue],
              [dict.hero.date, dict.hero.dateValue],
            ].map(([label, value]) => (
              <div key={label}>
                <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-white/40">
                  {label}
                </span>
                <span className="mt-1 block text-sm font-medium text-white/80">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Why Agentic (Pink Floyd transition) ---------- */}
      <EvolutionSection copy={dict.evolution} locale={locale} />

      {/* ---------- Metrics ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2
          className="text-3xl font-bold text-white"
          style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
        >
          {dict.metrics.title}
        </h2>
        <p className="mt-3 max-w-xl text-sm text-white/55">{dict.metrics.subtitle}</p>
        <div className="mt-10 max-w-3xl">
          <WeightBars data={weights} weightLabel={dict.metrics.weightLabel} />
        </div>
      </section>

      {/* ---------- Curriculum index ---------- */}
      <section className="border-t border-white/15">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2
            className="text-3xl font-bold text-white"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            {dict.curriculum.title}
          </h2>
          <p className="mt-3 max-w-xl text-sm text-white/55">
            {dict.curriculum.subtitle}
          </p>

          <div className="mt-10 grid grid-cols-1 gap-px border border-white/15 bg-white/15 sm:grid-cols-2">
            {docs.map((doc) => (
              <Link
                key={doc.slug}
                href={`/${locale}/guide#${doc.slug}`}
                className="group flex flex-col gap-3 bg-black p-6 transition hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/40 group-hover:text-black/50">
                    {doc.section}
                  </span>
                  {doc.weight !== undefined && (
                    <span className="shrink-0 border border-white/30 px-2 py-0.5 font-mono text-[10px] font-bold text-white group-hover:border-black/40 group-hover:text-black">
                      {doc.weight}%
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold leading-snug text-white group-hover:text-black">
                  {doc.title}
                </h3>
                {doc.badge && (
                  <span className="w-fit border border-white px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-white group-hover:border-black group-hover:text-black">
                    {doc.badge}
                  </span>
                )}
                <span className="mt-auto pt-2 font-mono text-[10px] uppercase tracking-widest text-white/35 group-hover:text-black/60">
                  {dict.curriculum.open} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Sample certificate (dynamic modules) ---------- */}
      <CertificateSection
        copy={dict.certificate}
        modules={docs
          .filter((doc) => doc.weight !== undefined)
          .map((doc) => ({ title: doc.title, weight: doc.weight }))}
      />

      {/* ---------- Contact & Apply (email + AI deeplinks) ---------- */}
      <ApplySection copy={dict.apply} promptTemplate={promptTemplate} />
    </>
  );
}
