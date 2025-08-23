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
                We are committed to protecting your privacy. Our MP4 to GIF converter processes all files locally in
                your browser. We do not upload, store, or have access to your video files.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">How We Use Information</h2>
              <p>
                We may collect anonymous usage statistics to improve our service, including page views and conversion
                metrics. No personal files or data are collected.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Data Security</h2>
              <p>
                Since all processing happens in your browser, your files never leave your device. This ensures maximum
                security and privacy for your content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Cookies</h2>
              <p>
                We use cookies for analytics and to remember your preferences. You can disable cookies in your browser
                settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us at contact@mp4togif.com.</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
