import type { Dictionary } from "@/lib/i18n";

export function SiteFooter({ dict }: { dict: Dictionary }) {
  return (
    <footer className="print-hidden mt-auto border-t border-white/15">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <a
          href={dict.footer.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all font-mono text-[11px] tracking-wide text-white/45 transition hover:text-white sm:whitespace-nowrap"
        >
          {dict.footer.sourceLabel} — {dict.footer.sourceText}
        </a>
        <p className="font-mono text-[11px] tracking-wide text-white/45 sm:whitespace-nowrap sm:text-right">
          {dict.footer.linePrefix}
          <a
            href={dict.footer.brandUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 underline decoration-white/30 underline-offset-2 transition hover:text-white hover:decoration-white"
          >
            {dict.footer.lineBrand}
          </a>
          {dict.footer.lineSuffix}
        </p>
      </div>
    </footer>
  );
}
