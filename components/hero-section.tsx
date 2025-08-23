"use client"

import { useState, useEffect } from "react"
import { Sparkles, Play, ArrowRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function HeroSection() {
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = ["Lightning Fast Conversion", "100% Browser-Based", "No File Size Limits", "Professional Quality"]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative overflow-hidden py-20 px-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 dark:from-purple-500/20 dark:via-pink-500/20 dark:to-blue-500/20" />

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse" />
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 animate-bounce" />
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-20 animate-ping" />
        <div className="absolute bottom-40 right-1/3 w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-20 animate-pulse" />
      </div>

      <div className="relative max-w-6xl mx-auto text-center">
        {/* Badge */}
        <Badge className="mb-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-foreground border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300">
          <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
          Free • Fast • Secure
        </Badge>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
          Convert{" "}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
            MP4
          </span>{" "}
          to{" "}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent animate-pulse">
            GIF
          </span>
        </h1>

        {/* Animated Feature Text */}
        <div className="h-8 mb-8">
          <p className="text-xl text-muted-foreground transition-all duration-500 transform">
            {features[currentFeature]}
          </p>
        </div>

        {/* Description */}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Transform your videos into high-quality animated GIFs instantly. No uploads, no registration, no limits - just
          pure conversion power in your browser.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-4 text-lg group transition-all duration-300 transform hover:scale-105"
            onClick={() => document.getElementById("converter")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Play className="w-5 h-5 mr-2 group-hover:animate-pulse" />
            Start Converting
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="border-2 border-purple-500/30 text-foreground hover:bg-purple-500/10 px-8 py-4 text-lg transition-all duration-300 bg-transparent"
          >
            <Zap className="w-5 h-5 mr-2 text-yellow-400" />
            See Features
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
          {[
            { value: "1M+", label: "Conversions" },
            { value: "50K+", label: "Happy Users" },
            { value: "99.9%", label: "Success Rate" },
            { value: "0s", label: "Wait Time" },
          ].map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1 group-hover:scale-110 transition-transform">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
