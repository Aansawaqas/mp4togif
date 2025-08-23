import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { GoogleAnalytics } from "@/components/google-analytics"
import { GoogleAdsense } from "@/components/google-adsense"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MP4 to GIF Converter - Free Online Video to GIF Tool",
  description:
    "Convert MP4 videos to high-quality GIFs online for free. Professional video to GIF converter with custom settings, trimming, and instant download.",
  keywords: "MP4 to GIF, video converter, GIF maker, online converter, video to GIF, free converter, MP4 converter",
  authors: [{ name: "MP4 to GIF Converter" }],
  creator: "MP4 to GIF Converter",
  publisher: "MP4 to GIF Converter",
  robots: "index, follow",
  openGraph: {
    title: "MP4 to GIF Converter - Free Online Video to GIF Tool",
    description:
      "Convert MP4 videos to high-quality GIFs online for free. Professional video to GIF converter with custom settings, trimming, and instant download.",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "MP4 to GIF Converter",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MP4 to GIF Converter",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MP4 to GIF Converter - Free Online Video to GIF Tool",
    description: "Convert MP4 videos to high-quality GIFs online for free.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
    generator: 'v0.app'
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "MP4 to GIF Converter",
  description:
    "Convert MP4 videos to high-quality GIFs online for free. Professional video to GIF converter with custom settings, trimming, and instant download.",
  url: process.env.NEXT_PUBLIC_SITE_URL,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "MP4 to GIF conversion",
    "Custom quality settings",
    "Video trimming",
    "Instant download",
    "No watermarks",
    "Free to use",
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <GoogleAnalytics />
        <GoogleAdsense />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Suspense>{children}</Suspense>
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
