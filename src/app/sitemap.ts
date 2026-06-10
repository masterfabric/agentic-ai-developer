import type { MetadataRoute } from "next";

const SITE_URL = "https://academy.masterfabric.co";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${SITE_URL}/en`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          en: `${SITE_URL}/en`,
          tr: `${SITE_URL}/tr`,
        },
      },
    },
    {
      url: `${SITE_URL}/tr`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          en: `${SITE_URL}/en`,
          tr: `${SITE_URL}/tr`,
        },
      },
    },
    {
      url: `${SITE_URL}/en/guide`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          en: `${SITE_URL}/en/guide`,
          tr: `${SITE_URL}/tr/guide`,
        },
      },
    },
    {
      url: `${SITE_URL}/tr/guide`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          en: `${SITE_URL}/en/guide`,
          tr: `${SITE_URL}/tr/guide`,
        },
      },
    },
  ];
}
