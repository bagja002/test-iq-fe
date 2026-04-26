import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { getSiteUrl } from "@/lib/site-url"
import { cn } from "@/lib/utils"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "TO Try Out KDMP KNMP | Koperasi Desa Merah Putih",
    template: "%s | TO KDMP KNMP",
  },
  description:
    "Platform TO dan Try Out KDMP KNMP untuk persiapan Koperasi Desa Merah Putih, Koperasi Nelayan Merah Putih, test kognitif, dan SKB jabatan koperasi.",
  keywords: [
    "TO",
    "TRY OUT",
    "KDMP",
    "KNMP",
    "Koperasi",
    "Nelayan",
    "Koperasi Desa Merah Putih",
    "Koperasi Nelayan Merah Putih",
    "Try Out KDMP",
    "Try Out KNMP",
    "Soal Koperasi Desa Merah Putih",
    "Soal Koperasi Nelayan Merah Putih",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TO Try Out KDMP KNMP | Koperasi Desa Merah Putih",
    description:
      "Platform TO dan Try Out KDMP KNMP untuk persiapan Koperasi Desa Merah Putih dan Koperasi Nelayan Merah Putih.",
    url: "/",
    siteName: "TO KDMP KNMP",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TO Try Out KDMP KNMP",
    description:
      "Persiapan Koperasi Desa Merah Putih dan Koperasi Nelayan Merah Putih dengan TO, Try Out, test kognitif, dan SKB koperasi.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const defaultSnapURL =
    process.env.NODE_ENV === "development"
      ? "https://app.sandbox.midtrans.com/snap/snap.js"
      : "https://app.midtrans.com/snap/snap.js"

  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-screen">
        <ThemeProvider>{children}</ThemeProvider>
        <Script
          className="z-9999"
          src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || defaultSnapURL}
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""}
          strategy="lazyOnload"
        />
      </body>

    </html>
  )
}
