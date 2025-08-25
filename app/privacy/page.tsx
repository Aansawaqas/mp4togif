import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Privacy Policy - Gif Maker | Your Data Protection & Privacy Rights",
  description:
    "Learn how Gif Maker protects your privacy and handles your data. We prioritize user privacy and security in all our file conversion services.",
  keywords: "privacy policy, data protection, file security, user privacy, Gif Maker privacy",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Privacy Policy",
  description: "Gif Maker's privacy policy and data protection practices",
  url: "https://www.makegifs.online/privacy",
}

export default function PrivacyPage() {
  return (
    <div className="space-y-8 pt-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: May 1, 2025</p>
      </div>

      <Card>
        <CardContent className="pt-6 prose prose-gray dark:prose-invert max-w-none">
          <h2>Introduction</h2>
          <p>
            At Gif Maker, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect
            your information when you use our file conversion services.
          </p>

          <h2>Information We Collect</h2>
          <h3>Files You Upload</h3>
          <p>When you use our conversion tools, you upload files to our servers for processing. These files are:</p>
          <ul>
            <li>Processed immediately for conversion</li>
            <li>Automatically deleted from our servers within 1 hour</li>
            <li>Never stored permanently or accessed by our team</li>
            <li>Not used for any purpose other than the requested conversion</li>
          </ul>

          <h3>Usage Data</h3>
          <p>We may collect anonymous usage data including:</p>
          <ul>
            <li>Number of conversions performed</li>
            <li>File types converted</li>
            <li>General geographic location (country level)</li>
            <li>Browser type and version</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul>
            <li>Provide and improve our conversion services</li>
            <li>Monitor service performance and reliability</li>
            <li>Understand usage patterns to enhance user experience</li>
            <li>Ensure service security and prevent abuse</li>
          </ul>

          <h2>Data Security</h2>
          <p>We implement industry-standard security measures:</p>
          <ul>
            <li>SSL/TLS encryption for all data transmission</li>
            <li>Secure server infrastructure with regular updates</li>
            <li>Automatic file deletion after processing</li>
            <li>No permanent storage of user files</li>
          </ul>

          <h2>Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li>
              <strong>Google Analytics:</strong> For anonymous usage statistics
            </li>
            <li>
              <strong>Google AdSense:</strong> For displaying relevant advertisements
            </li>
          </ul>
          <p>These services have their own privacy policies and may collect data according to their terms.</p>

          <h2>Cookies</h2>
          <p>
            We use minimal cookies for essential functionality and analytics. You can disable cookies in your browser
            settings, though this may affect some features.
          </p>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Use our services without creating an account</li>
            <li>Request information about data we collect</li>
            <li>Opt out of analytics tracking</li>
            <li>Contact us with privacy concerns</li>
          </ul>

          <h2>Children's Privacy</h2>
          <p>
            Our services are not directed to children under 13. We do not knowingly collect personal information from
            children under 13.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify users of any material changes by posting
            the new policy on this page.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:contact@www.makegifs.online">contact@makegifs.online</a>.
          </p>
        </CardContent>
      </Card>

      <Footer />
    </div>
  )
}
