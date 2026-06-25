"use client";

import { useMemo, useState } from "react";
import type { CertifiedDeveloper } from "@/lib/certificated";

export interface CertifiedListCopy {
  searchPlaceholder: string;
  count: string;
  empty: string;
  noMatch: string;
  credentialLabel: string;
  issuedLabel: string;
  instructorLabel: string;
  addLinkedin: string;
  share: string;
  copied: string;
  whatsapp: string;
  download: string;
  view: string;
  whatsappMessage: string;
}

const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  ocak: 1, şubat: 2, subat: 2, mart: 3, nisan: 4, mayıs: 5, mayis: 5,
  haziran: 6, temmuz: 7, ağustos: 8, agustos: 8, eylül: 9, eylul: 9,
  ekim: 10, kasım: 11, kasim: 11, aralık: 12, aralik: 12,
};

function parseIssueDate(value: string): { year?: string; month?: number } {
  const yearMatch = value.match(/\d{4}/);
  const year = yearMatch?.[0];
  const monthKey = value
    .toLowerCase()
    .replace(/[0-9.,]/g, "")
    .trim()
    .split(/\s+/)
    .find((w) => w in MONTHS);
  return { year, month: monthKey ? MONTHS[monthKey] : undefined };
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function buildLinks(dev: CertifiedDeveloper, repoUrl: string) {
  const base = repoUrl.replace(/\/$/, "");
  const fileName = dev.fileName;
  const pdfRaw = `${base}/raw/main/certificated-developers/${fileName}`;
  const blobUrl = `${base}/blob/main/certificated-developers/${fileName}`;
  // Always share a working GitHub link (the printed verifyUrl omits /blob/main).
  const verifyUrl = blobUrl;

  const { year, month } = parseIssueDate(dev.issueDate);
  const linkedin = new URL("https://www.linkedin.com/profile/add");
  linkedin.searchParams.set("startTask", "CERTIFICATION_NAME");
  linkedin.searchParams.set("name", dev.program || dev.documentTitle);
  // LinkedIn org is "MasterFabric" (drop the trailing "Academy").
  const organizationName = dev.issuer.replace(/\s*academy\s*$/i, "").trim();
  if (organizationName) linkedin.searchParams.set("organizationName", organizationName);
  if (year) linkedin.searchParams.set("issueYear", year);
  if (month) linkedin.searchParams.set("issueMonth", String(month));
  if (dev.credentialId) linkedin.searchParams.set("certId", dev.credentialId);
  linkedin.searchParams.set("certUrl", blobUrl);

  return { pdfRaw, blobUrl, verifyUrl, linkedinUrl: linkedin.toString() };
}

function ActionLink({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest transition ${
        primary
          ? "border-white bg-white text-black hover:bg-black hover:text-white"
          : "border-white/30 text-white/70 hover:border-white hover:bg-white hover:text-black"
      }`}
    >
      {children}
    </a>
  );
}

function DeveloperCard({
  dev,
  repoUrl,
  copy,
}: {
  dev: CertifiedDeveloper;
  repoUrl: string;
  copy: CertifiedListCopy;
}) {
  const [copied, setCopied] = useState(false);
  const { pdfRaw, blobUrl, verifyUrl, linkedinUrl } = useMemo(
    () => buildLinks(dev, repoUrl),
    [dev, repoUrl],
  );

  async function share() {
    const text = copy.whatsappMessage
      .replace("{name}", dev.recipientName)
      .replace("{program}", dev.program)
      .replace("{id}", dev.credentialId);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: dev.recipientName, text, url: verifyUrl });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.open(verifyUrl, "_blank", "noopener,noreferrer");
    }
  }

  const waMessage = copy.whatsappMessage
    .replace("{name}", dev.recipientName)
    .replace("{program}", dev.program)
    .replace("{id}", dev.credentialId);
  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${waMessage}\n${verifyUrl}`)}`;

  return (
    <article className="group flex flex-col border border-white/15 bg-white/[0.02] p-5 transition hover:border-white/40">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/25 font-mono text-xs font-bold tracking-widest text-white/80">
          {initials(dev.recipientName)}
        </div>
        <div className="min-w-0 flex-1">
          <a
            href={blobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate text-lg italic text-white transition hover:text-white/70"
            style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
            title={dev.recipientName}
          >
            {dev.recipientName || "—"}
          </a>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-white/40">
            {copy.credentialLabel}: <span className="text-white/70">{dev.credentialId}</span>
          </p>
        </div>
      </div>

      <dl className="mt-4 space-y-1.5 border-t border-white/10 pt-4 text-[11px] text-white/55">
        <div className="flex justify-between gap-3">
          <dt className="text-white/35">{dev.program ? "Program" : ""}</dt>
          <dd className="text-right text-white/70">{dev.program}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-white/35">{copy.issuedLabel}</dt>
          <dd className="text-right text-white/70">{dev.issueDate}</dd>
        </div>
        {dev.instructor && (
          <div className="flex justify-between gap-3">
            <dt className="text-white/35">{copy.instructorLabel}</dt>
            <dd className="text-right text-white/70">{dev.instructor}</dd>
          </div>
        )}
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        <ActionLink href={linkedinUrl} primary>
          {copy.addLinkedin}
        </ActionLink>
        <ActionLink href={pdfRaw}>{copy.download}</ActionLink>
        <ActionLink href={waUrl}>{copy.whatsapp}</ActionLink>
        <button
          type="button"
          onClick={share}
          className="inline-flex items-center gap-1.5 border border-white/30 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white/70 transition hover:border-white hover:bg-white hover:text-black"
        >
          {copied ? copy.copied : copy.share}
        </button>
      </div>
    </article>
  );
}

export function CertifiedDevelopersList({
  developers,
  repoUrl,
  copy,
}: {
  developers: CertifiedDeveloper[];
  repoUrl: string;
  copy: CertifiedListCopy;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return developers;
    return developers.filter(
      (d) =>
        d.recipientName.toLowerCase().includes(q) ||
        d.credentialId.toLowerCase().includes(q),
    );
  }, [developers, query]);

  if (developers.length === 0) {
    return <p className="mt-10 text-sm text-white/45">{copy.empty}</p>;
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={copy.searchPlaceholder}
          className="w-full max-w-sm border border-white/20 bg-white/[0.03] px-3 py-2 font-mono text-xs text-white outline-none transition focus:border-white/60"
        />
        <span className="font-mono text-[11px] uppercase tracking-widest text-white/40">
          {copy.count.replace("{n}", String(filtered.length))}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-sm text-white/45">{copy.noMatch}</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((dev) => (
            <DeveloperCard
              key={dev.credentialId}
              dev={dev}
              repoUrl={repoUrl}
              copy={copy}
            />
          ))}
        </div>
      )}
    </div>
  );
}
