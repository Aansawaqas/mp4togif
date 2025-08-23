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
                By using our MP4 to GIF converter, you agree to these terms of service. If you do not agree, please do
                not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Use of Service</h2>
              <p>
                Our service is provided free of charge for personal and commercial use. You may convert your own videos
                or videos you have permission to convert.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Prohibited Uses</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Converting copyrighted content without permission</li>
                <li>Using the service for illegal activities</li>
                <li>Attempting to reverse engineer or hack the service</li>
                <li>Overloading our servers with excessive requests</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Disclaimer</h2>
              <p>
                The service is provided "as is" without warranties. We are not liable for any damages resulting from the
                use of our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Contact</h2>
              <p>For questions about these terms, contact us at contact@mp4togif.com.</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
