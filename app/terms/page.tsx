"use client"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-8 text-muted-foreground space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Acceptance of Terms</h2>
              <p>
                By accessing and using MakeGifs.online, you agree to be bound by these Terms of Service. 
                If you do not agree, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Use of Service</h2>
              <p>
                MakeGifs.online provides free online tools to convert videos (including MP4) into animated GIFs and other formats. 
                The service is available for both personal and commercial use, provided you have the right to use and convert the content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Prohibited Uses</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Uploading copyrighted material without proper authorization</li>
                <li>Using the service for illegal, harmful, or offensive purposes</li>
                <li>Attempting to hack, reverse engineer, or disrupt the service</li>
                <li>Overloading servers with automated abuse or excessive requests</li>
                <li>Processing files containing malware, viruses, or malicious code</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">File Processing</h2>
              <p>
                Files uploaded to our service are processed automatically and deleted from our servers within one hour. 
                However, we recommend not uploading sensitive or confidential content. We do not guarantee the quality or accuracy 
                of conversions and advise keeping a copy of your original files.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Intellectual Property</h2>
              <p>
                You retain all rights to your uploaded content. MakeGifs.online claims no ownership over user files. 
                Our platform, design, and technology are protected by intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Disclaimer</h2>
              <p>
                The service is provided "as is" without warranties of any kind, either express or implied. 
                We are not liable for any direct or indirect damages arising from your use of MakeGifs.online, 
                including data loss, service interruptions, or conversion errors.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Modifications & Termination</h2>
              <p>
                We reserve the right to modify these terms at any time. Continued use constitutes acceptance. 
                We may suspend or terminate access for violations without notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Contact</h2>
              <p>
                For questions about these terms, please contact us at{" "}
                <a href="mailto:contact@makegifs.online" className="text-primary underline">
                  contact@makegifs.online
                </a>.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
