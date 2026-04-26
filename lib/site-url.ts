export function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_API_URL?.replace(":8080", ":3000") ??
    "http://localhost:3000"

  return raw.replace(/\/+$/, "")
}
