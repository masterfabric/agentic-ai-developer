import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getDictionary, isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const SITE_URL = "https://academy.masterfabric.co";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: {
      default: dict.meta.title,
      template: `%s | ${dict.meta.siteName}`,
    },
    description: dict.meta.description,
    keywords: dict.meta.keywords,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        tr: "/tr",
        "x-default": "/en",
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "tr" ? "tr_TR" : "en_US",
      url: `${SITE_URL}/${locale}`,
      siteName: dict.meta.siteName,
      title: dict.meta.ogTitle,
      description: dict.meta.ogDescription,
      images: [
        {
          url: "/academy-badge.png",
          alt: dict.meta.siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.ogTitle,
      description: dict.meta.ogDescription,
      images: ["/academy-badge.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  return (
    <div className="flex min-h-screen flex-col bg-black text-white" lang={locale}>
      <SiteHeader locale={locale} dict={dict} />
      <main className="flex-1">{children}</main>
      <SiteFooter dict={dict} locale={locale} />
    </div>
  );
}
