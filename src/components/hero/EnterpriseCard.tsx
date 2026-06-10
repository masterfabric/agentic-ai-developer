const ACADEMY_EMAIL = "academy@masterfabric.co";

export interface EnterpriseCopy {
  kicker: string;
  title: string;
  description: string;
  points: string[];
  cta: string;
  subject: string;
}

/**
 * Enterprise / large-organization card in the hero: separate application
 * channel for custom training programs and project partnership.
 */
export function EnterpriseCard({ copy }: { copy: EnterpriseCopy }) {
  const mailtoHref = `mailto:${ACADEMY_EMAIL}?subject=${encodeURIComponent(copy.subject)}`;

  return (
    <div className="instructor-card mt-12 max-w-2xl border border-white/15 bg-white/[0.03] p-6 sm:p-8">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-white/40">
        {copy.kicker}
      </span>
      <h2
        className="mt-3 text-xl font-bold leading-snug text-white sm:text-2xl"
        style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
      >
        {copy.title}
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55">
        {copy.description}
      </p>

      <ul className="mt-5 space-y-1.5">
        {copy.points.map((point) => (
          <li
            key={point}
            className="flex items-baseline gap-2.5 font-mono text-[11px] uppercase tracking-widest text-white/60"
          >
            <span className="text-white">+</span>
            {point}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <a
          href={mailtoHref}
          className="border border-white bg-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-black transition hover:bg-black hover:text-white"
        >
          {copy.cta}
        </a>
        <span className="font-mono text-[11px] tracking-wide text-white/40">
          {ACADEMY_EMAIL}
        </span>
      </div>
    </div>
  );
}
