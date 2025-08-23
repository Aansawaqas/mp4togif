"use client"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function Cookies() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="bg-card backdrop-blur-lg border-border">
          <CardContent className="p-8 text-muted-foreground space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">What Are Cookies</h2>
              <p>
                Cookies are small text files stored on your device when you visit our website. They help us provide a
                better user experience.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">How We Use Cookies</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Analytics cookies to understand how you use our site</li>
                <li>Preference cookies to remember your settings</li>
                <li>Performance cookies to improve site functionality</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Managing Cookies</h2>
              <p>
                You can control cookies through your browser settings. Disabling cookies may affect site functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Contact</h2>
              <p>Questions about our cookie policy? Contact us at contact@mp4togif.com.</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
