import type { Metadata } from "next";
import Link from "next/link";
import { AcademyBadge } from "@/components/brand/AcademyBadge";
import { MasterFabricLogo } from "@/components/brand/MasterFabricLogo";
import { defaultLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "404 — Page not found | MasterFabric Academy",
  description: "The page you are looking for does not exist or has been moved.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black text-white">
      {/* Faint brand watermark, matching the hero treatment */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
        <MasterFabricLogo className="absolute -right-24 -top-24 h-[480px] w-[600px] text-white" />
        <MasterFabricLogo className="absolute -bottom-32 -left-24 h-[420px] w-[520px] text-white" />
      </div>

      {/* Brand bar */}
      <header className="relative z-10 border-b border-white/15">
        <div className="mx-auto flex h-20 max-w-6xl items-center gap-3 px-6">
          <Link href={`/${defaultLocale}`} className="flex items-center gap-3">
            <AcademyBadge size={48} className="border border-white/20" />
            <span className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-wide text-white">
                MasterFabric
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/50">
                Academy
              </span>
            </span>
          </Link>
        </div>
      </header>

      {/* Body */}
      <main className="relative z-10 flex flex-1 items-center">
        <div className="mx-auto w-full max-w-6xl px-6 py-24">
          <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-white/45">
            Error // 404
          </span>

          <h1
            className="mt-6 text-7xl font-extrabold leading-none tracking-tight text-white sm:text-9xl"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
          >
            404
          </h1>

          <div className="mt-6 h-1 w-20 bg-white" />

          <h2 className="mt-6 max-w-2xl text-2xl font-bold text-white sm:text-3xl">
            This page could not be found.
          </h2>
          <p className="mt-3 max-w-xl text-sm text-white/55">
            The address may be mistyped, or the page may have been moved or
            retired. Use the links below to get back on track.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={`/${defaultLocale}`}
              className="border border-white bg-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-black transition hover:bg-black hover:text-white"
            >
              Back to home
            </Link>
            <Link
              href={`/${defaultLocale}/guide`}
              className="border border-white/40 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white transition hover:border-white hover:bg-white hover:text-black"
            >
              Open the Study Guide
            </Link>
          </div>

          <p className="mt-12 font-mono text-[11px] uppercase tracking-widest text-white/30">
            MasterFabric Academy // Agentic AI Developer
          </p>
        </div>
      </main>
    </div>
  );
}
