import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://custodia360.onrender.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/terminos-y-condiciones", "/politica-de-privacidad", "/politica-de-cookies", "/contacto-legal"],
        disallow: ["/owner", "/platform", "/login", "/cliente", "/consulta", "/api", "/auth", "/chofer", "/operativo", "/owner-mobile"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
