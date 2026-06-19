import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CertifiedDevelopersList,
  type CertifiedListCopy,
} from "@/components/certificated/CertifiedDevelopersList";
import { getCertifiedDevelopers } from "@/lib/certificated";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

interface PageCopy {
  kicker: string;
  title: string;
  subtitle: string;
  sourceNote: string;
  list: CertifiedListCopy;
}

const COPY: Record<Locale, PageCopy> = {
  en: {
    kicker: "Registry // Certified Developers",
    title: "Certified Developers",
    subtitle:
      "Graduates of the Agentic AI Developer Training. Every credential is published in the open repository — add it to your LinkedIn profile, share it, or download the signed PDF certificate.",
    sourceNote: "Source of truth: certificated-developers folder on GitHub",
    list: {
      searchPlaceholder: "Search by name or credential ID…",
      count: "{n} listed",
      empty: "No certified developers published yet.",
      noMatch: "No developer matches your search.",
      credentialLabel: "Credential",
      issuedLabel: "Issued",
      instructorLabel: "Instructor",
      addLinkedin: "Add to LinkedIn",
      share: "Share link",
      copied: "Copied!",
      whatsapp: "WhatsApp",
      download: "Download PDF",
      view: "View",
      whatsappMessage:
        "{name} is a certified Agentic AI Developer — {program} (credential {id}).",
    },
  },
  tr: {
    kicker: "Kayıt // Sertifikalı Geliştiriciler",
    title: "Sertifikalı Geliştiriciler",
    subtitle:
      "Agentic AI Developer Training mezunları. Her sertifika açık depoda yayımlanır — LinkedIn profilinize ekleyin, paylaşın veya imzalı PDF sertifikayı indirin.",
    sourceNote: "Kaynak: GitHub'daki certificated-developers klasörü",
    list: {
      searchPlaceholder: "İsim veya sertifika no ile ara…",
      count: "{n} kayıt",
      empty: "Henüz yayımlanmış sertifikalı geliştirici yok.",
      noMatch: "Aramanızla eşleşen geliştirici yok.",
      credentialLabel: "Sertifika",
      issuedLabel: "Veriliş",
      instructorLabel: "Eğitmen",
      addLinkedin: "LinkedIn'e ekle",
      share: "Bağlantıyı paylaş",
      copied: "Kopyalandı!",
      whatsapp: "WhatsApp",
      download: "PDF indir",
      view: "Görüntüle",
      whatsappMessage:
        "{name} sertifikalı bir Agentic AI Developer — {program} (sertifika {id}).",
    },
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = COPY[locale];
  return {
    title: copy.title,
    description: copy.subtitle,
    alternates: {
      canonical: `/${locale}/certificated-developers`,
      languages: {
        en: "/en/certificated-developers",
        tr: "/tr/certificated-developers",
        "x-default": "/en/certificated-developers",
      },
    },
  };
}

export default async function CertifiedDevelopersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const copy = COPY[locale];
  const developers = getCertifiedDevelopers();
  const repoUrl = dict.footer.sourceUrl.replace(/\/$/, "");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-white/45">
        {copy.kicker}
      </span>
      <h1
        className="mt-4 text-3xl font-bold text-white sm:text-4xl"
        style={{ fontFamily: "var(--font-lora), Georgia, serif" }}
      >
        {copy.title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-white/55">{copy.subtitle}</p>
      <a
        href={`${repoUrl}/tree/main/certificated-developers`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block font-mono text-[10px] uppercase tracking-widest text-white/40 underline decoration-white/20 underline-offset-4 transition hover:text-white hover:decoration-white"
      >
        {copy.sourceNote} ↗
      </a>

      <CertifiedDevelopersList
        developers={developers}
        repoUrl={repoUrl}
        copy={copy.list}
      />
    </div>
  );
}
