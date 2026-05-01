const DEFAULT_DEV_API_URL = "http://localhost:8080"

function normalizeBaseUrl(value: string | undefined) {
  const trimmed = value?.trim()
  if (!trimmed || trimmed === "/") {
    return ""
  }

  return trimmed.replace(/\/+$/, "")
}

const API_URL =
  normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL) ||
  (process.env.NODE_ENV === "development" ? DEFAULT_DEV_API_URL : "")

function hasUrlScheme(value: string) {
  return /^[a-z][a-z\d+.-]*:/i.test(value)
}

function normalizeQuestionAssetPath(path: string) {
  const legacyStoragePrefixes = [
    "/api/v1/storage/question-assets/",
    "/storage/question-assets/",
  ]

  for (const prefix of legacyStoragePrefixes) {
    if (path.startsWith(prefix)) {
      return `/api/v1/question-assets/${path.slice(prefix.length)}`
    }
  }

  return path
}

export function questionMediaSrc(value: string | null | undefined) {
  const trimmed = value?.trim()
  if (!trimmed) {
    return ""
  }
  if (hasUrlScheme(trimmed)) {
    if (!/^https?:/i.test(trimmed)) {
      return trimmed
    }

    try {
      const url = new URL(trimmed)
      url.pathname = normalizeQuestionAssetPath(url.pathname)
      return url.toString()
    } catch {
      return trimmed
    }
  }

  const path = normalizeQuestionAssetPath(trimmed.startsWith("/") ? trimmed : `/${trimmed}`)
  if (path.startsWith("/api/v1/question-assets/") && API_URL) {
    return `${API_URL}${path}`
  }

  return path
}
