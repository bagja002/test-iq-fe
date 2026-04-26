import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Test IQ Ku",
  description: "Platform Test IQ untuk screening kandidat berbasis Next.js dan Go Fiber",
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
