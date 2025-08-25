import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Terms of Service - MakeGifs.online | Usage Terms & Conditions",
  description:
    "Read the terms of service for MakeGifs.online. Understand your rights and responsibilities when using our free GIF and file conversion tools.",
  keywords: "terms of service, usage terms, MakeGifs.online terms, GIF converter conditions, file conversion legal",
  openGraph: {
    title: "Terms of Service - MakeGifs.online",
    description: "Usage terms and conditions for MakeGifs.online's free online conversion tools.",
    url: "https://makegifs.online/terms",
    type: "website",
  },
  alternates: {
    canonical: "https://makegifs.online/terms",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Terms of Service",
  description: "Terms and conditions for using MakeGifs.online's free online GIF and file conversion services.",
  url: "https://makegifs.online/terms",
  publisher: {
    "@type": "Organization",
    name: "MakeGifs.online",
    url: "https://makegifs.online",
    logo: "https://makegifs.online/logo.svg",
  },
  inLanguage: "en-US",
  datePublished: "2025-08-25",
  dateModified: new Date().toISOString().split("T")[0],
}

export default function TermsPage() {
  return (
    <div className="space-y-8 pt-24">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: August 25, 2025</p>
      </div>

      <Card>
        <CardContent className="pt-6 prose prose-gray dark:prose-invert max-w-none">
          <h2>Acceptance of Terms</h2>
          <p>
            By accessing or using the services provided by <strong>MakeGifs.online</strong>, you agree to be bound by these Terms of Service. 
            If you do not agree, please do not use our services.
          </p>

          <h2>Description of Service</h2>
          <p>
            MakeGifs.online offers free online tools to convert videos (including MP4) into animated GIFs, as well as other file format conversions. 
            All processing is designed to be fast, simple, and secure, with a focus on user privacy and ease of use.
          </p>

          <h2>User Responsibilities</h2>
          <p>You agree to:</p>
          <ul>
            <li>Use the service only for lawful and ethical purposes</li>
            <li>Not upload content protected by copyright unless you have proper authorization</li>
            <li>Not attempt to interfere with, damage, or disrupt the service or its infrastructure</li>
            <li>Not use bots, scrapers, or automated tools to overload or abuse our systems</li>
            <li>Comply with file size limits and usage guidelines to ensure fair access for all users</li>
          </ul>

          <h2>Prohibited Content</h2>
          <p>You must not upload or process files that contain:</p>
          <ul>
            <li>Illegal, harmful, threatening, or offensive material</li>
            <li>Content that infringes on intellectual property rights</li>
            <li>Malware, viruses, or any form of malicious software</li>
            <li>Personal or sensitive information of others without their consent</li>
            <li>Adult, exploitative, or otherwise inappropriate content</li>
          </ul>

          <h2>Service Availability</h2>
          <p>
            We aim to provide reliable and continuous service, but we do not guarantee 100% uptime. 
            We reserve the right to modify, suspend, or discontinue any part of our service at any time without notice.
          </p>

          <h2>File Processing & Data Handling</h2>
          <p>
            Files you upload are processed temporarily and automatically deleted from our systems within one hour. 
            However, since processing occurs server-side for certain tools, we recommend avoiding uploading sensitive or confidential files. 
            For maximum privacy, use our client-side tools where processing happens entirely in your browser.
          </p>
          <p>
            We do not guarantee the accuracy, quality, or compatibility of converted files. Always keep a backup of your original files.
          </p>

          <h2>Intellectual Property</h2>
          <p>
            You retain all ownership rights to the content you upload. 
            MakeGifs.online does not claim any rights over your files. 
            However, our website design, branding, software, and underlying technology are protected by copyright and intellectual property laws.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            The service is provided "as is" and "as available" without warranties of any kind, either express or implied. 
            To the fullest extent permitted by law, MakeGifs.online is not liable for any direct, indirect, incidental, or consequential damages 
            arising from your use of the service, including data loss, service interruptions, or unauthorized access.
          </p>

          <h2>Privacy</h2>
          <p>
            We take your privacy seriously. We collect minimal data for analytics and service improvement. 
            For details, please read our <a href="/privacy" className="underline">Privacy Policy</a>.
          </p>

          <h2>Modifications to Terms</h2>
          <p>
            We may update these Terms of Service at any time. Changes will be posted on this page with a revised "Last updated" date. 
            Continued use of the service after such changes constitutes acceptance of the updated terms.
          </p>

          <h2>Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to MakeGifs.online immediately and without notice 
            if we believe you have violated these terms or engaged in harmful behavior.
          </p>

          <h2>Governing Law</h2>
          <p>
            These terms are governed by the laws of the jurisdiction where the service is operated, 
            without regard to conflict of law principles.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at{" "}
            <a href="mailto:contact@makegifs.online" className="underline">
              contact@makegifs.online
            </a>.
          </p>
        </CardContent>
      </Card>

      <Footer />
    </div>
  )
}
