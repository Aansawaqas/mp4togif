"use client"

import { useEffect } from "react"
import { Film, Users, Target, Award } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const stats = [
    { icon: Users, label: "Happy Users", value: "50K+", color: "text-blue-400" },
    { icon: Film, label: "Videos Converted", value: "1M+", color: "text-green-400" },
    { icon: Target, label: "Success Rate", value: "99.9%", color: "text-yellow-400" },
    { icon: Award, label: "Years Experience", value: "5+", color: "text-purple-400" },
  ]

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">About Our MP4 to GIF Converter</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're passionate about making video conversion simple, fast, and accessible to everyone.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-card backdrop-blur-lg border-border text-center">
              <CardContent className="p-6">
                <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-muted-foreground/80 text-sm">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Story */}
        <Card className="bg-card backdrop-blur-lg border-border mb-12">
          <CardHeader>
            <CardTitle className="text-foreground text-2xl">Our Story</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <p>
              Founded in 2019, our MP4 to GIF converter was born out of frustration with existing tools that were either
              too complex, too slow, or required expensive software installations.
            </p>
            <p>
              We believed that converting videos to GIFs should be as simple as dragging and dropping a file. That's why
              we built a tool that runs entirely in your browser, ensuring your files never leave your device while
              providing professional-grade conversion quality.
            </p>
            <p>
              Today, we're proud to serve over 50,000 users worldwide, from content creators and marketers to students
              and professionals who need quick, reliable video-to-GIF conversion.
            </p>
          </CardContent>
        </Card>

        {/* Mission */}
        <Card className="bg-card backdrop-blur-lg border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-2xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <p>
              To democratize video conversion by providing free, fast, and secure tools that anyone can use without
              technical expertise or expensive software.
            </p>
            <p>
              We're committed to privacy, performance, and user experience. Every feature we build is designed with
              these principles in mind.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
