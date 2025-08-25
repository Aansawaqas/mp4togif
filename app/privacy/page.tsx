"use client"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-8 text-muted-foreground space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Information We Collect</h2>
              <p>
                We are committed to protecting your privacy. At <strong>makegifs.online</strong>, all file processing occurs directly in your browser. 
                We do not upload, store, or have access to your video files. Your MP4 files and resulting GIFs remain entirely on your device.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">How We Use Information</h2>
              <p>
                We may collect anonymous usage data—such as page views, feature usage, and performance metrics—through privacy-friendly analytics tools. 
                This data helps us improve our service and user experience. No personal files, content, or identifiable information is ever collected or shared.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Data Security</h2>
              <p>
                Since all conversion processes happen locally in your browser, your files never leave your device. 
                This ensures maximum security, privacy, and confidentiality for your content. We do not transmit your media to any server.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Cookies and Tracking</h2>
              <p>
                We use minimal cookies for essential functionality and anonymized analytics. These cookies help remember your preferences (like theme or quality settings) 
                and understand how users interact with our site. You can manage or disable cookies through your browser settings at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Third-Party Services</h2>
              <p>
                We use trusted third-party services for analytics (e.g., Plausible or similar privacy-focused tools) that do not track personal data or use cookies for advertising. 
                These services comply with strict privacy regulations and do not collect personally identifiable information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Children's Privacy</h2>
              <p>
                Our service is not directed to children under 13. We do not knowingly collect personal information from children. 
                If you believe we may have collected such data, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. 
                We encourage you to review this policy periodically for any updates.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Contact Us</h2>
              <p>
                If you have any questions or concerns about this Privacy Policy, please contact us at: 
                <a href="mailto:contact@makegifs.online" className="underline ml-1">
                  contact@makegifs.online
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
