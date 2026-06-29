import { MasterFabricLogo } from "@/components/brand/MasterFabricLogo";
import { certificateFileBase } from "@/lib/csv";

export interface RoadmapRow {
  days: string;
  focus: string;
  content: string;
  goal: string;
}

export interface TraineeProgram {
  slug: string;
  name: string;
  /** Roadmap heading parsed from the source markdown. */
  title: string;
  rows: RoadmapRow[];
  /** GitHub tree URL for the program folder. */
  sourceUrl: string;
}

export interface TraineeTemplate {
  docTitle: string;
  /** Program line, e.g. "Flutter — 100 Days Trainee Program". */
  program: string;
  presentedTo: string;
  completedText: string;
  issuedLabel: string;
  issuedValue: string;
  refLabel: string;
  directorLabel: string;
  directorName: string;
  instructorLabel: string;
  instructorName: string;
  instructorGithub: string;
  instructorLinkedin: string;
  verifyLabel: string;
  verifyUrl: string;
  showSeal: boolean;
  /** Page 2 strings. */
  scopeTitle: string;
  scopeIntro: string;
  daysCol: string;
  focusCol: string;
  goalCol: string;
  durationLabel: string;
  durationValue: string;
  sourceLabel: string;
  pageWord: string;
}

export interface TraineeRecipient {
  name: string;
  credentialId: string;
  date?: string;
}

function AcademyBadge() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/academy-badge.png"
      alt="MasterFabric Academy"
      width={72}
      height={72}
      className="h-[72px] w-[72px] rounded-full border border-white/20"
    />
  );
}

function VerificationSeal() {
  return (
    <div className="absolute right-5 top-5 hidden flex-col items-center gap-1.5 sm:flex">
      <div className="relative h-14 w-14">
        <svg viewBox="0 0 56 56" className="absolute inset-0 h-full w-full">
          <circle
            cx="28"
            cy="28"
            r="25"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.45"
            strokeWidth="1"
            strokeDasharray="4 5"
          />
        </svg>
        <svg viewBox="0 0 56 56" className="absolute inset-0 h-full w-full">
          <circle
            cx="28"
            cy="28"
            r="18"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.2"
            strokeWidth="1"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm text-white">
          ✓
        </span>
      </div>
      <span className="font-mono text-[8px] uppercase tracking-widest text-white/45">
        VERIFIED ✓
      </span>
    </div>
  );
}

/**
 * Page 1 — the headline certificate of continued participation. Mirrors the
 * primary certificate layout but is tuned for the Trainee program.
 */
function PageOne({
  template,
  recipient,
  program,
  verifyHref,
}: {
  template: TraineeTemplate;
  recipient: TraineeRecipient;
  program: TraineeProgram | null;
  verifyHref: string;
}) {
  const issued = recipient.date?.trim() || template.issuedValue;
  return (
    <div className="border border-white/40 bg-black p-2">
      <div className="relative overflow-hidden border border-white/20 px-6 py-12 sm:px-14">
        <MasterFabricLogo className="pointer-events-none absolute -bottom-16 -right-16 h-72 w-80 text-white opacity-[0.04]" />
        {template.showSeal && <VerificationSeal />}

        <div className="relative flex flex-col items-center text-center">
          <AcademyBadge />

          <span className="mt-8 font-mono text-[10px] uppercase tracking-[0.5em] text-white/50">
            {template.docTitle}
          </span>
          <h3
            className="mt-3 text-3xl font-bold text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            {template.program}
          </h3>
          <div className="mt-4 h-px w-24 bg-white/40" />

          <p className="mt-8 text-xs uppercase tracking-widest text-white/45">
            {template.presentedTo}
          </p>
          <p
            className="mt-2 text-2xl italic text-white sm:text-3xl"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            {recipient.name || "—"}
          </p>
          <p className="mt-3 max-w-xl text-xs leading-relaxed text-white/55">
            {template.completedText}
          </p>

          {program && (
            <div className="mt-8 grid w-full grid-cols-3 gap-px border border-white/15 bg-white/15 text-center">
              <div className="bg-black px-3 py-4">
                <span className="block text-2xl font-bold text-white">100</span>
                <span className="mt-1 block font-mono text-[8px] uppercase tracking-widest text-white/45">
                  {template.durationValue}
                </span>
              </div>
              <div className="bg-black px-3 py-4">
                <span className="block text-2xl font-bold text-white">
                  {program.rows.length}
                </span>
                <span className="mt-1 block font-mono text-[8px] uppercase tracking-widest text-white/45">
                  {template.focusCol}
                </span>
              </div>
              <div className="bg-black px-3 py-4">
                <span
                  className="block truncate text-base font-bold text-white"
                  title={program.name}
                >
                  {program.name}
                </span>
                <span className="mt-1 block font-mono text-[8px] uppercase tracking-widest text-white/45">
                  {template.scopeTitle}
                </span>
              </div>
            </div>
          )}

          <div className="mt-12 grid w-full grid-cols-1 items-end gap-8 text-left sm:grid-cols-3">
            <div>
              <span className="block font-mono text-[9px] uppercase tracking-widest text-white/40">
                {template.issuedLabel}
              </span>
              <span className="mt-1 block text-xs text-white/80">{issued}</span>
            </div>
            <div className="text-center">
              <span className="block font-mono text-[9px] uppercase tracking-widest text-white/40">
                {template.refLabel}
              </span>
              <span className="mt-1 block font-mono text-xs text-white/80">
                {recipient.credentialId || "—"}
              </span>
            </div>
            <div className="text-right">
              <span
                className="block text-lg italic text-white"
                style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
              >
                {template.directorName}
              </span>
              <div className="ml-auto mt-1 h-px w-40 bg-white/40" />
              <span className="mt-1 block font-mono text-[9px] uppercase tracking-widest text-white/40">
                {template.directorLabel}
              </span>
            </div>
          </div>

          {(template.instructorName ||
            template.instructorGithub ||
            template.verifyUrl) && (
            <div className="mt-8 grid w-full grid-cols-1 gap-6 border-t border-white/15 pt-5 text-left sm:grid-cols-2">
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-widest text-white/40">
                  {template.instructorLabel}
                </span>
                {template.instructorName && (
                  <span
                    className="mt-1 block text-sm italic text-white"
                    style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
                  >
                    {template.instructorName}
                  </span>
                )}
                <span className="mt-1 block font-mono text-[10px] leading-relaxed text-white/55">
                  {template.instructorGithub && (
                    <span className="block">
                      github.com/{template.instructorGithub}
                    </span>
                  )}
                  {template.instructorLinkedin && (
                    <span className="block">
                      linkedin.com/in/{template.instructorLinkedin}
                    </span>
                  )}
                </span>
              </div>
              {verifyHref && (
                <div className="sm:text-right">
                  <span className="block font-mono text-[9px] uppercase tracking-widest text-white/40">
                    {template.verifyLabel}
                  </span>
                  <span className="mt-1 block break-all font-mono text-[10px] text-white/55">
                    {verifyHref}
                  </span>
                </div>
              )}
            </div>
          )}

          <span className="mt-8 font-mono text-[8px] uppercase tracking-[0.4em] text-white/30">
            {template.pageWord} 1 / 2
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Page 2 — the program scope & roadmap, fetched live from the source repo.
 * This is the "continuation" page that proves the depth of the curriculum
 * the trainee progressed through.
 */
function PageTwo({
  template,
  recipient,
  program,
}: {
  template: TraineeTemplate;
  recipient: TraineeRecipient;
  program: TraineeProgram | null;
}) {
  return (
    <div className="border border-white/40 bg-black p-2">
      <div className="relative overflow-hidden border border-white/20 px-6 py-10 sm:px-12">
        <MasterFabricLogo className="pointer-events-none absolute -top-16 -left-16 h-72 w-80 text-white opacity-[0.04]" />

        <div className="relative">
          <div className="flex items-center justify-between gap-4 border-b border-white/15 pb-5">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/50">
                {template.scopeTitle}
              </span>
              <h3
                className="mt-2 text-2xl font-bold text-white sm:text-3xl"
                style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
              >
                {program ? program.name : "—"}
              </h3>
            </div>
            <AcademyBadge />
          </div>

          <p className="mt-4 max-w-2xl text-[11px] leading-relaxed text-white/55">
            {template.scopeIntro}
          </p>

          {program && program.rows.length > 0 ? (
            <div className="mt-6 overflow-hidden border border-white/15">
              <div className="grid grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1.4fr)] gap-px bg-white/15 font-mono text-[8px] font-bold uppercase tracking-widest text-white">
                <span className="bg-black px-2 py-2">{template.daysCol}</span>
                <span className="bg-black px-2 py-2">{template.focusCol}</span>
                <span className="bg-black px-2 py-2">{template.goalCol}</span>
              </div>
              <div className="divide-y divide-white/10">
                {program.rows.map((row, i) => (
                  <div
                    key={`${row.days}-${i}`}
                    className="grid grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1.4fr)] gap-3 px-2 py-1.5"
                  >
                    <span className="font-mono text-[9px] text-white/70">
                      {row.days}
                    </span>
                    <span className="text-[10px] font-medium leading-snug text-white/85">
                      {row.focus}
                    </span>
                    <span className="text-[9px] leading-snug text-white/55">
                      {row.goal || row.content}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-10 text-center text-xs text-white/40">
              {template.scopeIntro}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-white/15 pt-4">
            <div>
              <span className="block font-mono text-[9px] uppercase tracking-widest text-white/40">
                {template.sourceLabel}
              </span>
              <span className="mt-1 block break-all font-mono text-[9px] text-white/55">
                {program?.sourceUrl ?? "—"}
              </span>
            </div>
            <div className="text-right">
              <span className="block font-mono text-[9px] uppercase tracking-widest text-white/40">
                {template.refLabel}
              </span>
              <span className="mt-1 block font-mono text-[10px] text-white/80">
                {recipient.credentialId || "—"}
              </span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <span className="font-mono text-[8px] uppercase tracking-[0.4em] text-white/30">
              {template.pageWord} 2 / 2
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Static, capture-friendly two-page Trainee certificate. Render one page at a
 * time (via `page`) inside a fixed-width box for deterministic export, or both
 * stacked for an on-screen preview.
 */
export function TraineeCertificateDocument({
  template,
  recipient,
  program,
  page,
}: {
  template: TraineeTemplate;
  recipient: TraineeRecipient;
  program: TraineeProgram | null;
  /** Render a single page; omit to render both pages stacked. */
  page?: 1 | 2;
}) {
  const verifyHref =
    template.verifyUrl && recipient.credentialId
      ? `${template.verifyUrl.replace(/\/$/, "")}/${certificateFileBase(
          recipient.credentialId,
        )}`
      : "";

  if (page === 1) {
    return (
      <PageOne
        template={template}
        recipient={recipient}
        program={program}
        verifyHref={verifyHref}
      />
    );
  }
  if (page === 2) {
    return (
      <PageTwo template={template} recipient={recipient} program={program} />
    );
  }

  return (
    <div className="space-y-6">
      <PageOne
        template={template}
        recipient={recipient}
        program={program}
        verifyHref={verifyHref}
      />
      <PageTwo template={template} recipient={recipient} program={program} />
    </div>
  );
}
