"use client"

import { Zap, Shield, Download, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Convert your MP4 videos to GIFs in seconds with our optimized processing engine.",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
  },
  {
    icon: Shield,
    title: "100% Secure",
    description: "Your files are processed locally in your browser. No uploads to our servers.",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
  },
  {
    icon: Download,
    title: "Instant Download",
    description: "Download your converted GIFs immediately with no waiting time or registration.",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  {
    icon: Settings,
    title: "Custom Settings",
    description: "Fine-tune quality, frame rate, dimensions, and trim your videos with precision.",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
  },
]

export default function Features() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Why Choose Our Converter?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience the best MP4 to GIF conversion with professional features and unmatched quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-card/50 backdrop-blur-lg border-border hover:bg-card/80 transition-all duration-300 group"
            >
              <CardHeader className="text-center">
                <div
                  className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <CardTitle className="text-foreground text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
