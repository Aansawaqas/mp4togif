"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ImageIcon, Zap, Crop, RotateCcw, Droplets, RefreshCw, ArrowRight, Star, Users, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Script from "next/script"

const imageTools = [
  {
    name: "Image Compressor",
    href: "/image-compressor",
    icon: Zap,
    description: "Reduce file size without losing quality. Perfect for web optimization and faster loading times.",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/20",
    popular: true,
    ready: true,
  },
  {
    name: "Image Resizer",
    href: "/image-resizer",
    icon: ImageIcon,
    description: "Resize images to any dimension with social media presets and custom sizing options.",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/20",
    popular: true,
    ready: true,
  },
  {
    name: "Image Converter",
    href: "/image-converter",
    icon: RefreshCw,
    description: "Convert between different formats including JPEG, PNG, WebP, GIF, and more.",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/20",
    popular: false,
    ready: false,
  },
  {
    name: "Image Cropper",
    href: "/image-cropper",
    icon: Crop,
    description: "Crop images to perfect dimensions with precision tools and aspect ratio presets.",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/20",
    popular: false,
    ready: false,
  },
  {
    name: "Image Rotator",
    href: "/image-rotator",
    icon: RotateCcw,
    description: "Rotate images to any angle with quick presets and custom degree controls.",
    color: "text-pink-400",
    bgColor: "bg-pink-400/10",
    borderColor: "border-pink-400/20",
    popular: false,
    ready: false,
  },
  {
    name: "Image Watermarker",
    href: "/image-watermarker",
    icon: Droplets,
    description: "Add text or logo watermarks to protect your images with custom positioning.",
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    borderColor: "border-cyan-400/20",
    popular: false,
    ready: false,
  },
]

export default function ImageToolsOverview() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const readyTools = imageTools.filter((tool) => tool.ready)
  const comingSoonTools = imageTools.filter((tool) => !tool.ready)

  return (
    <>
      {/* Schema Markup */}
      <Script id="image-tools-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Image Editing Tools",
          description:
            "Free online image editing tools including compressor, resizer, converter, cropper, rotator, and watermarker. Professional image processing in your browser.",
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/image-tools`,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: [
            "Image compression",
            "Image resizing",
            "Format conversion",
            "Image cropping",
            "Image rotation",
            "Watermarking",
          ],
        })}
      </Script>

      <div className="space-y-8">
        {/* Hero Section */}
        <Card className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-blue-500/20">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Professional Image Editing Tools</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
              Complete suite of image editing tools that work entirely in your browser. No uploads, no registration, no
              limits - just powerful image processing.
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-muted-foreground">100% Private</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-muted-foreground">Lightning Fast</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-muted-foreground">50K+ Users</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Tools */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-yellow-400" />
            <h2 className="text-2xl font-bold text-foreground">Available Now</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {readyTools.map((tool) => (
              <Card
                key={tool.href}
                className={`${tool.bgColor} backdrop-blur-lg border ${tool.borderColor} hover:scale-105 transition-all duration-300 group`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 ${tool.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                      >
                        <tool.icon className={`w-6 h-6 ${tool.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-foreground flex items-center gap-2">
                          {tool.name}
                          {tool.popular && (
                            <Badge className="bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 text-xs">
                              Popular
                            </Badge>
                          )}
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{tool.description}</p>
                  <Button asChild className="w-full group-hover:bg-primary/90">
                    <Link href={tool.href}>
                      Try {tool.name}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Coming Soon Tools */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <RefreshCw className="w-5 h-5 text-blue-400" />
            <h2 className="text-2xl font-bold text-foreground">Coming Soon</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comingSoonTools.map((tool) => (
              <Card
                key={tool.href}
                className={`${tool.bgColor} backdrop-blur-lg border ${tool.borderColor} opacity-75 hover:opacity-100 transition-all duration-300`}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${tool.bgColor} rounded-lg flex items-center justify-center`}>
                      <tool.icon className={`w-5 h-5 ${tool.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-foreground text-lg flex items-center gap-2">
                        {tool.name}
                        <Badge variant="secondary" className="text-xs">
                          Soon
                        </Badge>
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">{tool.description}</p>
                  <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
                    <Link href={tool.href}>Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <Card className="bg-card/50 backdrop-blur-lg border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-center">Why Choose Our Image Tools?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Privacy First</h3>
                <p className="text-sm text-muted-foreground">
                  All processing happens in your browser. Your images never leave your device.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">
                  Instant processing with no waiting times or server uploads.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Trusted by Thousands</h3>
                <p className="text-sm text-muted-foreground">
                  Join over 50,000 users who trust our tools for their image editing needs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
