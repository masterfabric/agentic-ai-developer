import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CertificateGenerator,
  type GeneratorCopy,
} from "@/components/generator/CertificateGenerator";
import { getDocs } from "@/lib/content";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const COPY: Record<Locale, GeneratorCopy> = {
  en: {
    kicker: "Tools // Certificate Generator",
    title: "Certificate Generator Tool",
    subtitle:
      "Upload a CSV of recipients, edit the certificate template in the web editor, then generate and download each certificate as PNG, PDF, or all of them at once as a ZIP archive.",
    steps: ["Upload CSV / data", "Edit template", "Generate & download"],
    tabs: { data: "Data", template: "Template", preview: "Preview", export: "Export" },
    uploadTitle: "1 · Recipient data",
    uploadHint:
      "Upload a CSV with a header row. Recognized columns: name, credentialId, date. Missing IDs are auto-generated from the prefix below.",
    uploadButton: "Upload CSV",
    pasteLabel: "…or paste CSV",
    pastePlaceholder: "name,credentialId,date\nAli Yurtsever,MFA-AG-2026-0001,June 2026",
    parseButton: "Load pasted CSV",
    sampleButton: "Load sample",
    recipientsTitle: "Recipients",
    recipientsEmpty: "No recipients yet. Upload a CSV, paste data, or add one manually.",
    addRecipient: "Add recipient",
    nameCol: "Name",
    idCol: "Credential ID",
    dateCol: "Date",
    remove: "Remove",
    templateTitle: "2 · Template editor",
    fields: {
      docTitle: "Document title",
      program: "Program",
      presentedTo: "Presented-to line",
      completedText: "Completion line",
      issuedLabel: "Issue label",
      issuedValue: "Issue date (default)",
      refLabel: "Credential label",
      directorLabel: "Signatory title",
      directorName: "Signatory name",
      credentialPrefix: "Credential ID prefix",
      instructorName: "Instructor name",
      instructorGithub: "Instructor GitHub (nickname)",
      instructorLinkedin: "Instructor LinkedIn (handle)",
      verifyUrl: "Verify base URL — credential ID is appended per certificate",
    },
    showModules: "Show module list",
    showSeal: "Show verification seal",
    previewTitle: "Live preview",
    prev: "Prev",
    next: "Next",
    exportTitle: "3 · Generate & download",
    downloadPng: "Download PNG",
    downloadPdf: "Download PDF",
    downloadMeta: "Metadata CSV (selected)",
    metaNote:
      "Files are named masterfabric-academy-<credential-id>.pdf. The Metadata CSV button exports only the selected attendee; the ZIP still bundles a metadata CSV for the whole batch.",
    zipFormatLabel: "ZIP format",
    downloadZip: "Download all as ZIP",
    generating: "Generating {done}/{total}…",
    noRecipients: "Add a recipient to see the preview.",
  },
  tr: {
    kicker: "Araçlar // Sertifika Üretici",
    title: "Sertifika Üretici Aracı",
    subtitle:
      "Alıcıların listesini CSV olarak yükleyin, sertifika şablonunu web editöründe düzenleyin, ardından her sertifikayı PNG, PDF olarak ya da tümünü tek seferde ZIP arşivi olarak üretip indirin.",
    steps: ["CSV / veri yükle", "Şablonu düzenle", "Üret & indir"],
    tabs: { data: "Veri", template: "Şablon", preview: "Önizleme", export: "İndir" },
    uploadTitle: "1 · Alıcı verisi",
    uploadHint:
      "Başlık satırı olan bir CSV yükleyin. Tanınan sütunlar: name, credentialId, date. Eksik kimlikler aşağıdaki önekten otomatik üretilir.",
    uploadButton: "CSV Yükle",
    pasteLabel: "…veya CSV yapıştır",
    pastePlaceholder: "name,credentialId,date\nAli Yurtsever,MFA-AG-2026-0001,Haziran 2026",
    parseButton: "Yapıştırılan CSV'yi yükle",
    sampleButton: "Örnek yükle",
    recipientsTitle: "Alıcılar",
    recipientsEmpty:
      "Henüz alıcı yok. CSV yükleyin, veri yapıştırın veya elle bir tane ekleyin.",
    addRecipient: "Alıcı ekle",
    nameCol: "İsim",
    idCol: "Sertifika No",
    dateCol: "Tarih",
    remove: "Kaldır",
    templateTitle: "2 · Şablon editörü",
    fields: {
      docTitle: "Belge başlığı",
      program: "Program",
      presentedTo: "Takdim satırı",
      completedText: "Tamamlama satırı",
      issuedLabel: "Tarih etiketi",
      issuedValue: "Veriliş tarihi (varsayılan)",
      refLabel: "Sertifika etiketi",
      directorLabel: "İmza unvanı",
      directorName: "İmza sahibi",
      credentialPrefix: "Sertifika No öneki",
      instructorName: "Eğitmen adı",
      instructorGithub: "Eğitmen GitHub (kullanıcı adı)",
      instructorLinkedin: "Eğitmen LinkedIn (kullanıcı adı)",
      verifyUrl: "Doğrulama temel URL'si — her sertifikaya kimlik eklenir",
    },
    showModules: "Modül listesini göster",
    showSeal: "Doğrulama mührünü göster",
    previewTitle: "Canlı önizleme",
    prev: "Önceki",
    next: "Sonraki",
    exportTitle: "3 · Üret & indir",
    downloadPng: "PNG indir",
    downloadPdf: "PDF indir",
    downloadMeta: "Meta CSV (seçili)",
    metaNote:
      "Dosyalar masterfabric-academy-<sertifika-no>.pdf biçiminde adlandırılır. Meta CSV butonu yalnızca seçili katılımcıyı indirir; ZIP ise tüm grup için meta CSV içerir.",
    zipFormatLabel: "ZIP biçimi",
    downloadZip: "Tümünü ZIP indir",
    generating: "Üretiliyor {done}/{total}…",
    noRecipients: "Önizlemeyi görmek için bir alıcı ekleyin.",
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
      canonical: `/${locale}/certificate-generator`,
      languages: {
        en: "/en/certificate-generator",
        tr: "/tr/certificate-generator",
        "x-default": "/en/certificate-generator",
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function CertificateGeneratorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [dict, docs] = await Promise.all([getDictionary(locale), getDocs(locale)]);
  const cert = dict.certificate;

  const modules = docs
    .filter((doc) => doc.weight !== undefined)
    .map((doc) => ({ title: doc.title, weight: doc.weight }));

  const repoUrl = dict.footer.sourceUrl.replace(/\/$/, "");

  return (
    <CertificateGenerator
      copy={COPY[locale]}
      modules={modules}
      defaults={{
        docTitle: cert.docTitle,
        program: cert.program,
        presentedTo: cert.presentedTo,
        completedText: cert.completedText,
        issuedLabel: cert.issuedLabel,
        issuedValue: cert.issuedValue,
        refLabel: cert.refLabel,
        directorLabel: cert.directorLabel,
        directorName: cert.directorName,
        weightWord: cert.weightWord,
        instructorLabel: locale === "tr" ? "Eğitmen" : "Instructor",
        instructorName: "Gürkan Fikret Günak",
        instructorGithub: "gurkanfikretgunak",
        instructorLinkedin: "gurkanfikretgunak",
        verifyLabel: locale === "tr" ? "Sertifika doğrulama" : "Verify credential",
        verifyUrl: `${repoUrl}/certificated-developers`,
        showModules: true,
        showSeal: true,
        credentialPrefix: "MFA-AG-2026",
        sampleName: cert.sampleName,
      }}
    />
  );
}
