import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CertificateGenerator,
  type GeneratorCopy,
} from "@/components/generator/CertificateGenerator";
import type { CertModule } from "@/components/generator/CertificateDocument";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

/**
 * Mobile Developer Training curriculum — 12 modules covering the standard
 * Dart + Flutter mobile development scope. Weights sum to 100.
 */
const MODULES: Record<Locale, CertModule[]> = {
  en: [
    { title: "Dart Language Fundamentals", weight: 8 },
    { title: "Object-Oriented & Asynchronous Dart", weight: 8 },
    { title: "Flutter SDK & Widget Architecture", weight: 12 },
    { title: "Layouts, Theming & Responsive UI", weight: 8 },
    { title: "Navigation & Routing", weight: 8 },
    { title: "State Management (Provider · Riverpod · Bloc)", weight: 10 },
    { title: "Networking & REST/GraphQL Integration", weight: 9 },
    { title: "Local Persistence & Offline Storage", weight: 8 },
    { title: "Native Device Features & Platform Channels", weight: 7 },
    { title: "Testing & Debugging (Unit · Widget · Integration)", weight: 8 },
    { title: "Performance Optimization & Flutter DevTools", weight: 7 },
    { title: "CI/CD, Release & App Store / Play Store Deployment", weight: 7 },
  ],
  tr: [
    { title: "Dart Dili Temelleri", weight: 8 },
    { title: "Nesne Yönelimli ve Asenkron Dart", weight: 8 },
    { title: "Flutter SDK ve Widget Mimarisi", weight: 12 },
    { title: "Yerleşim, Tema ve Duyarlı Arayüz", weight: 8 },
    { title: "Navigasyon ve Yönlendirme", weight: 8 },
    { title: "Durum Yönetimi (Provider · Riverpod · Bloc)", weight: 10 },
    { title: "Ağ ve REST/GraphQL Entegrasyonu", weight: 9 },
    { title: "Yerel Depolama ve Çevrimdışı Veri", weight: 8 },
    { title: "Cihaz Özellikleri ve Platform Kanalları", weight: 7 },
    { title: "Test ve Hata Ayıklama (Birim · Widget · Entegrasyon)", weight: 8 },
    { title: "Performans Optimizasyonu ve Flutter DevTools", weight: 7 },
    { title: "CI/CD, Yayınlama ve App Store / Play Store Dağıtımı", weight: 7 },
  ],
};

const COPY: Record<Locale, GeneratorCopy> = {
  en: {
    kicker: "Tools // Mobile Developer Certificate",
    title: "Mobile Developer Certificate Generator",
    subtitle:
      "Generate completion certificates for the Mobile Developer Training (Dart language & Flutter SDK, 12 modules). Upload a CSV of recipients, edit the template, then download each certificate as PNG, PDF, or all at once as a ZIP archive.",
    steps: ["Upload CSV / data", "Edit template", "Generate & download"],
    tabs: { data: "Data", template: "Template", preview: "Preview", export: "Export" },
    uploadTitle: "1 · Recipient data",
    uploadHint:
      "Upload a CSV with a header row. Recognized columns: name, credentialId, date. Missing IDs are auto-generated from the prefix below.",
    uploadButton: "Upload CSV",
    pasteLabel: "…or paste CSV",
    pastePlaceholder: "name,credentialId,date\nAli Yurtsever,MFA-MD-2026-0001,June 2026",
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
    kicker: "Araçlar // Mobil Geliştirici Sertifikası",
    title: "Mobil Geliştirici Sertifika Üretici",
    subtitle:
      "Mobil Geliştirici Eğitimi (Dart dili & Flutter SDK, 12 modül) için tamamlama sertifikaları üretin. Alıcı listesini CSV olarak yükleyin, şablonu düzenleyin, ardından her sertifikayı PNG, PDF olarak ya da tümünü tek seferde ZIP arşivi olarak indirin.",
    steps: ["CSV / veri yükle", "Şablonu düzenle", "Üret & indir"],
    tabs: { data: "Veri", template: "Şablon", preview: "Önizleme", export: "İndir" },
    uploadTitle: "1 · Alıcı verisi",
    uploadHint:
      "Başlık satırı olan bir CSV yükleyin. Tanınan sütunlar: name, credentialId, date. Eksik kimlikler aşağıdaki önekten otomatik üretilir.",
    uploadButton: "CSV Yükle",
    pasteLabel: "…veya CSV yapıştır",
    pastePlaceholder: "name,credentialId,date\nAli Yurtsever,MFA-MD-2026-0001,Haziran 2026",
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
      canonical: `/${locale}/certificate-generator-md`,
      languages: {
        en: "/en/certificate-generator-md",
        tr: "/tr/certificate-generator-md",
        "x-default": "/en/certificate-generator-md",
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function MobileCertificateGeneratorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const cert = dict.certificate;
  const repoUrl = dict.footer.sourceUrl.replace(/\/$/, "");

  const program =
    locale === "tr" ? "Mobil Geliştirici Eğitimi" : "Mobile Developer Training";

  return (
    <CertificateGenerator
      copy={COPY[locale]}
      modules={MODULES[locale]}
      defaults={{
        docTitle: cert.docTitle,
        program,
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
        credentialPrefix: "MFA-MD-2026",
        sampleName: cert.sampleName,
      }}
    />
  );
}
