import { cookies } from "next/headers"

const API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

type FetchApiOptions = RequestInit & {
  withCookies?: boolean
}

export async function fetchApi<T>(
  path: string,
  options: FetchApiOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers)

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json")
  }

  if (options.withCookies !== false) {
    const cookieStore = await cookies()
    const cookieHeader = cookieStore.toString()
    if (cookieHeader) {
      headers.set("Cookie", cookieHeader)
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  })


  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(data?.message ?? "Request failed")
  }

  console.log("data", data)

  return data as T
}
