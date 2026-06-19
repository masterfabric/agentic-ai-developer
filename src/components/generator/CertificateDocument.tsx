import { MasterFabricLogo } from "@/components/brand/MasterFabricLogo";
import { credentialSlug } from "@/lib/csv";

export interface CertModule {
  title: string;
  weight?: number;
}

export interface CertTemplate {
  docTitle: string;
  program: string;
  presentedTo: string;
  completedText: string;
  issuedLabel: string;
  issuedValue: string;
  refLabel: string;
  directorLabel: string;
  directorName: string;
  weightWord: string;
  instructorLabel: string;
  instructorName: string;
  instructorGithub: string;
  instructorLinkedin: string;
  verifyLabel: string;
  verifyUrl: string;
  showModules: boolean;
  showSeal: boolean;
}

export interface Recipient {
  name: string;
  credentialId: string;
  /** Optional per-row override of the issue date. */
  date?: string;
}

/**
 * Static, capture-friendly certificate document. No animations or live
 * effects so html-to-image renders a deterministic frame. Fills its
 * container width; render it inside a fixed-width box for batch export.
 */
export function CertificateDocument({
  template,
  recipient,
  modules,
}: {
  template: CertTemplate;
  recipient: Recipient;
  modules: CertModule[];
}) {
  const issued = recipient.date?.trim() || template.issuedValue;
  // Same slug as the downloadable file name so link and file always match.
  const verifyHref =
    template.verifyUrl && recipient.credentialId
      ? `${template.verifyUrl.replace(/\/$/, "")}/${credentialSlug(recipient.credentialId)}`
      : "";

  return (
    <div className="border border-white/40 bg-black p-2">
      <div className="relative overflow-hidden border border-white/20 px-6 py-12 sm:px-14">
        {/* Watermark */}
        <MasterFabricLogo className="pointer-events-none absolute -bottom-16 -right-16 h-72 w-80 text-white opacity-[0.04]" />

        {/* Static verification seal */}
        {template.showSeal && (
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
        )}

        <div className="relative flex flex-col items-center text-center">
          {/* Plain img (not next/image) so DOM-to-image capture stays reliable */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/academy-badge.png"
            alt="MasterFabric Academy"
            width={88}
            height={88}
            className="h-[88px] w-[88px] rounded-full border border-white/20"
          />

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
          <p className="mt-2 text-xs text-white/45">{template.completedText}</p>

          {template.showModules && modules.length > 0 && (
            <div className="mt-8 grid w-full grid-cols-1 gap-x-10 gap-y-1 text-left sm:grid-cols-2">
              {modules.map((mod) => (
                <div
                  key={mod.title}
                  className="flex items-baseline justify-between gap-3 border-b border-dashed border-white/15 py-2"
                >
                  <span className="text-[11px] leading-snug text-white/75">
                    {mod.title}
                  </span>
                  {mod.weight !== undefined && (
                    <span className="shrink-0 font-mono text-[10px] text-white/45">
                      {mod.weight}% {template.weightWord}
                    </span>
                  )}
                </div>
              ))}
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

          {/* Instructor + on-repo verification */}
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
                    <span className="block">github.com/{template.instructorGithub}</span>
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
        </div>
      </div>
    </div>
  );
}
