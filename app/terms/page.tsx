import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Terms of Service - makegifs.online | Usage Terms & Conditions",
  description:
    "Read the Terms of Service for makegifs.online. Understand your rights and responsibilities when using our free GIF and file conversion tools.",
  keywords: "terms of service, usage terms, makegifs.online terms, GIF converter conditions, file conversion legal",
  openGraph: {
    title: "Terms of Service - makegifs.online",
    description: "Official terms and conditions for using makegifs.online's free online conversion tools.",
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
  name: "Terms of Service - makegifs.online",
  description: "Terms and conditions governing the use of makegifs.online services.",
  url: "https://makegifs.online/terms",
  publisher: {
    "@type": "Organization",
    name: "makegifs.online",
    url: "https://makegifs.online",
    logo: "https://makegifs.online/logo.png",
  },
  inLanguage: "en-US",
  dateModified: "2024-01-01",
}

export default function TermsPage() {
  return (
    <div className="space-y-8 pt-24">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: January 1, 2024</p>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="pt-6 prose prose-gray dark:prose-invert max-w-none">
          <h2>Acceptance of Terms</h2>
          <p>
            By accessing and using <strong>makegifs.online</strong>, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. 
            If you do not agree, please do not use our services.
          </p>

          <h2>Description of Service</h2>
          <p>
            <strong>makegifs.online</strong> provides free online tools to convert videos, images, and other files into animated GIFs and various formats. 
            All processing is designed to be fast, secure, and user-friendly.
          </p>

          <h2>User Responsibilities</h2>
          <p>You agree to:</p>
          <ul>
            <li>Use the service only for lawful and ethical purposes</li>
            <li>Not upload content protected by copyright without proper authorization</li>
            <li>Not attempt to interfere with, damage, or disrupt the service</li>
            <li>Not use bots, scrapers, or automated tools to overload or abuse the system</li>
            <li>Respect file size limits and usage guidelines to ensure fair access for all users</li>
          </ul>

          <h2>Prohibited Content</h2>
          <p>You may not upload or convert files containing:</p>
          <ul>
            <li>Illegal, harmful, threatening, or offensive material</li>
            <li>Copyrighted content without the owner’s permission</li>
            <li>Malware, viruses, or any code designed to disrupt or damage systems</li>
            <li>Private or sensitive personal data of others without consent</li>
          </ul>

          <h2>Service Availability</h2>
          <p>
            We strive to keep <strong>makegifs.online</strong> available at all times, but we do not guarantee uninterrupted, error-free, or secure access. 
            We reserve the right to modify, suspend, or discontinue any part of the service at any time without notice.
          </p>

          <h2>File Processing & Data Handling</h2>
          <p>
            Files you upload are processed temporarily and automatically deleted from our servers within one hour. 
            No human review occurs, and we do not store or access your files beyond what is necessary for conversion. 
            However, we recommend keeping backups of your original files.
          </p>

          <h2>Intellectual Property</h2>
          <p>
            You retain all ownership rights to the content you upload. 
            <strong>makegifs.online</strong> claims no rights over your files. 
            Our platform, software, design, trademarks, and documentation are protected by intellectual property laws.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            The service is provided “as is” and “as available” without warranties of any kind, either express or implied. 
            We are not liable for any indirect, incidental, or consequential damages arising from your use of the service, 
            including data loss, conversion errors, or service downtime.
          </p>

          <h2>Privacy</h2>
          <p>
            Your privacy matters. We collect minimal data and do not store your files. 
            For full details, please review our <a href="/privacy" className="underline">Privacy Policy</a>.
          </p>

          <h2>Modifications to Terms</h2>
          <p>
            We may update these Terms of Service periodically. 
            The latest version will always be posted here with the “Last updated” date. 
            Continued use of the service after changes constitutes acceptance of the revised terms.
          </p>

          <h2>Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to <strong>makegifs.online</strong> at any time, 
            without notice, if we believe you have violated these terms.
          </p>

          <h2>Governing Law</h2>
          <p>
            These terms are governed by the laws of the jurisdiction where the service is operated, 
            without regard to its conflict of law principles.
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
