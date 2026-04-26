import type { MetadataRoute } from "next"

import { getSiteUrl } from "@/lib/site-url"

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()
  const now = new Date()

  const paths = [
    "",
    "/login",
    "/register",
    "/to-kdmp",
    "/try-out-knmp",
    "/koperasi-desa-merah-putih",
    "/koperasi-nelayan-merah-putih",
  ]

  return paths.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }))
}
