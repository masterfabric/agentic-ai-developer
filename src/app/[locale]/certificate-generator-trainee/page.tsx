import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  TraineeCertificateGenerator,
  type TraineeCopy,
  type TraineeProgramInfo,
} from "@/components/generator/TraineeCertificateGenerator";
import type { TraineeTemplate } from "@/components/generator/TraineeCertificateDocument";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { listPrograms } from "@/lib/roadmap";

export const dynamic = "force-dynamic";

const COPY: Record<Locale, TraineeCopy> = {
  en: {
    kicker: "Tools // Trainee Certificate",
    title: "Trainee Certificate Generator",
    subtitle:
      "Issue a two-page MasterFabric Academy Trainee certificate for participants who showed up and stuck with the program. Page two is built live from the program's 100-day roadmap fetched from the source repository.",
    tabs: {
      data: "Data",
      program: "Program",
      template: "Template",
      preview: "Preview",
      export: "Export",
    },
    uploadTitle: "1 · Recipient data",
    uploadHint:
      "Upload a CSV with a header row. Recognized columns: name, credentialId, date. Missing IDs are auto-generated from the prefix in the Template tab.",
    uploadButton: "Upload CSV",
    pasteLabel: "…or paste CSV",
    pastePlaceholder:
      "name,credentialId,date\nAli Yurtsever,MFA-TR-2026-0001,June 2026",
    parseButton: "Load pasted CSV",
    sampleButton: "Load sample",
    recipientsTitle: "Trainees",
    recipientsEmpty: "No trainees yet. Upload a CSV, paste data, or add one manually.",
    addRecipient: "Add trainee",
    nameCol: "Name",
    idCol: "Credential ID",
    dateCol: "Date",
    remove: "Remove",
    programTitle: "2 · Program roadmap",
    programHint:
      "Pick a program from the masterfabric/one-hundered-days repository. Its 100-day roadmap is fetched live and rendered as page two of the certificate.",
    programSelectLabel: "Program (days/*)",
    programLoading: "Loading roadmap…",
    programError:
      "Could not load the roadmap from GitHub (rate limit or network). Try Reload.",
    programReload: "Reload",
    roadmapRows: "roadmap stages",
    templateTitle: "3 · Template editor",
    fields: {
      docTitle: "Document title",
      program: "Program line",
      presentedTo: "Presented-to line",
      completedText: "Continuation line (page 1)",
      issuedValue: "Issue date (default)",
      directorName: "Signatory name",
      credentialPrefix: "Credential ID prefix",
      instructorName: "Instructor name",
      instructorGithub: "Instructor GitHub (nickname)",
      instructorLinkedin: "Instructor LinkedIn (handle)",
      verifyUrl: "Verify base URL — credential ID is appended per certificate",
      scopeIntro: "Scope intro (page 2)",
    },
    showSeal: "Show verification seal",
    previewTitle: "Live preview (2 pages)",
    prev: "Prev",
    next: "Next",
    exportTitle: "4 · Generate & download",
    downloadPng: "Download PNG (2 files)",
    downloadPdf: "Download PDF (2 pages)",
    downloadMeta: "Metadata CSV (selected)",
    metaNote:
      "Each certificate is a single 2-page PDF named masterfabric-academy-<credential-id>.pdf. PNG export writes one file per page; the ZIP bundles a metadata CSV for the whole batch.",
    zipFormatLabel: "ZIP format",
    downloadZip: "Download all as ZIP",
    generating: "Generating {done}/{total}…",
    noRecipients: "Add a trainee to see the preview.",
    selectProgramFirst:
      "Select a program in the Program tab to populate page two.",
  },
  tr: {
    kicker: "Araçlar // Trainee Sertifikası",
    title: "Trainee Sertifika Üretici",
    subtitle:
      "Programa katılıp uzun soluklu devam eden katılımcılar için iki sayfalık MasterFabric Academy Trainee sertifikası üretin. İkinci sayfa, kaynak depodan canlı çekilen 100 günlük program yol haritasından oluşturulur.",
    tabs: {
      data: "Veri",
      program: "Program",
      template: "Şablon",
      preview: "Önizleme",
      export: "İndir",
    },
    uploadTitle: "1 · Katılımcı verisi",
    uploadHint:
      "Başlık satırı olan bir CSV yükleyin. Tanınan sütunlar: name, credentialId, date. Eksik kimlikler Şablon sekmesindeki önekten otomatik üretilir.",
    uploadButton: "CSV Yükle",
    pasteLabel: "…veya CSV yapıştır",
    pastePlaceholder:
      "name,credentialId,date\nAli Yurtsever,MFA-TR-2026-0001,Haziran 2026",
    parseButton: "Yapıştırılan CSV'yi yükle",
    sampleButton: "Örnek yükle",
    recipientsTitle: "Trainee'ler",
    recipientsEmpty:
      "Henüz katılımcı yok. CSV yükleyin, veri yapıştırın veya elle bir tane ekleyin.",
    addRecipient: "Katılımcı ekle",
    nameCol: "İsim",
    idCol: "Sertifika No",
    dateCol: "Tarih",
    remove: "Kaldır",
    programTitle: "2 · Program yol haritası",
    programHint:
      "masterfabric/one-hundered-days deposundan bir program seçin. 100 günlük yol haritası canlı çekilir ve sertifikanın ikinci sayfası olarak işlenir.",
    programSelectLabel: "Program (days/*)",
    programLoading: "Yol haritası yükleniyor…",
    programError:
      "Yol haritası GitHub'dan yüklenemedi (limit veya ağ). Yeniden Yükle'yi deneyin.",
    programReload: "Yeniden Yükle",
    roadmapRows: "yol haritası aşaması",
    templateTitle: "3 · Şablon editörü",
    fields: {
      docTitle: "Belge başlığı",
      program: "Program satırı",
      presentedTo: "Takdim satırı",
      completedText: "Devamlılık satırı (sayfa 1)",
      issuedValue: "Veriliş tarihi (varsayılan)",
      directorName: "İmza sahibi",
      credentialPrefix: "Sertifika No öneki",
      instructorName: "Eğitmen adı",
      instructorGithub: "Eğitmen GitHub (kullanıcı adı)",
      instructorLinkedin: "Eğitmen LinkedIn (kullanıcı adı)",
      verifyUrl: "Doğrulama temel URL'si — her sertifikaya kimlik eklenir",
      scopeIntro: "Kapsam açıklaması (sayfa 2)",
    },
    showSeal: "Doğrulama mührünü göster",
    previewTitle: "Canlı önizleme (2 sayfa)",
    prev: "Önceki",
    next: "Sonraki",
    exportTitle: "4 · Üret & indir",
    downloadPng: "PNG indir (2 dosya)",
    downloadPdf: "PDF indir (2 sayfa)",
    downloadMeta: "Meta CSV (seçili)",
    metaNote:
      "Her sertifika, masterfabric-academy-<sertifika-no>.pdf adıyla tek bir 2 sayfalık PDF'tir. PNG dışa aktarımı sayfa başına bir dosya yazar; ZIP tüm grup için meta CSV içerir.",
    zipFormatLabel: "ZIP biçimi",
    downloadZip: "Tümünü ZIP indir",
    generating: "Üretiliyor {done}/{total}…",
    noRecipients: "Önizlemeyi görmek için bir katılımcı ekleyin.",
    selectProgramFirst:
      "İkinci sayfayı doldurmak için Program sekmesinden bir program seçin.",
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
      canonical: `/${locale}/certificate-generator-trainee`,
      languages: {
        en: "/en/certificate-generator-trainee",
        tr: "/tr/certificate-generator-trainee",
        "x-default": "/en/certificate-generator-trainee",
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function TraineeCertificateGeneratorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const cert = dict.certificate;
  const repoUrl = dict.footer.sourceUrl.replace(/\/$/, "");

  // Best-effort: prefetch the program list server-side. If GitHub is rate
  // limited the client can reload from the Program tab.
  let initialPrograms: TraineeProgramInfo[] = [];
  try {
    initialPrograms = await listPrograms();
  } catch {
    initialPrograms = [];
  }

  const isTr = locale === "tr";
  const firstName = initialPrograms[0]?.name ?? "Flutter";

  const template: TraineeTemplate & { credentialPrefix: string; sampleName: string } = {
    docTitle: isTr ? "Trainee Katılım Sertifikası" : "Certificate of Trainee Participation",
    program: `${firstName} — 100 Days Trainee Program`,
    presentedTo: cert.presentedTo,
    completedText: isTr
      ? "MasterFabric Academy Trainee programına katılım göstererek programı uzun soluklu ve istikrarlı biçimde sürdürmüştür."
      : "has actively participated in and consistently sustained the MasterFabric Academy Trainee program.",
    issuedLabel: cert.issuedLabel,
    issuedValue: cert.issuedValue,
    refLabel: cert.refLabel,
    directorLabel: cert.directorLabel,
    directorName: cert.directorName,
    instructorLabel: isTr ? "Eğitmen" : "Instructor",
    instructorName: "Gürkan Fikret Günak",
    instructorGithub: "gurkanfikretgunak",
    instructorLinkedin: "gurkanfikretgunak",
    verifyLabel: isTr ? "Sertifika doğrulama" : "Verify credential",
    verifyUrl: `${repoUrl}/certificated-developers`,
    showSeal: true,
    scopeTitle: isTr ? "Program Kapsamı" : "Program Scope",
    scopeIntro: isTr
      ? "Aşağıdaki 100 günlük yol haritası, katılımcının ilerlediği eğitim kapsamını ve devamlılık niteliğini belgeler. Kaynak: masterfabric/one-hundered-days."
      : "The 100-day roadmap below documents the curriculum scope and continued engagement the trainee progressed through. Source: masterfabric/one-hundered-days.",
    daysCol: isTr ? "Gün" : "Days",
    focusCol: isTr ? "Odak Alanı" : "Focus Area",
    goalCol: isTr ? "Hedef" : "Goal",
    durationLabel: isTr ? "Süre" : "Duration",
    durationValue: isTr ? "Gün" : "Days",
    sourceLabel: isTr ? "Kaynak yol haritası" : "Source roadmap",
    pageWord: isTr ? "Sayfa" : "Page",
    credentialPrefix: "MFA-TR-2026",
    sampleName: cert.sampleName,
  };

  return (
    <TraineeCertificateGenerator
      copy={COPY[locale]}
      initialPrograms={initialPrograms}
      defaults={template}
    />
  );
}
