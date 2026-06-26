import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://custodia360.onrender.com";
  const now = new Date();
  return ["", "/terminos-y-condiciones", "/politica-de-privacidad", "/politica-de-cookies", "/contacto-legal"].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route ? "monthly" : "weekly",
    priority: route ? 0.45 : 1,
  }));
}
