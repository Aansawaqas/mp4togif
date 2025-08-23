"use client"

import { useEffect } from "react"
import Link from "next/link"
import {
  FileText,
  FilePlus,
  Merge,
  Split,
  Zap,
  FileImage,
  Eye,
  Edit,
  ArrowRight,
  Star,
  Users,
  Shield,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Script from "next/script"

const pdfTools = [
  {
    name: "PDF Generator",
    href: "/pdf-generator",
    icon: FilePlus,
    description: "Create professional PDF documents from text, images, and HTML content with custom formatting.",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/20",
    popular: true,
    ready: true,
  },
  {
    name: "PDF Merger",
    href: "/pdf-merger",
    icon: Merge,
    description: "Combine multiple PDF files into one document with drag-and-drop reordering capabilities.",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/20",
    popular: true,
    ready: true,
  },
  {
    name: "PDF Splitter",
    href: "/pdf-splitter",
    icon: Split,
    description: "Split PDF documents into individual pages or custom page ranges with precision control.",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/20",
    popular: false,
    ready: false,
  },
  {
    name: "PDF Compressor",
    href: "/pdf-compressor",
    icon: Zap,
    description: "Reduce PDF file size by up to 90% while maintaining document quality and readability.",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/20",
    popular: true,
    ready: false,
  },
  {
    name: "PDF to Image",
    href: "/pdf-to-image",
    icon: FileImage,
    description: "Convert PDF pages to high-quality images in JPEG, PNG, or WebP format.",
    color: "text-pink-400",
    bgColor: "bg-pink-400/10",
    borderColor: "border-pink-400/20",
    popular: false,
    ready: false,
  },
  {
    name: "Image to PDF",
    href: "/image-to-pdf",
    icon: FileText,
    description: "Convert images to PDF documents with custom layouts and page size options.",
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    borderColor: "border-cyan-400/20",
    popular: false,
    ready: false,
  },
  {
    name: "PDF Viewer",
    href: "/pdf-viewer",
    icon: Eye,
    description: "View and navigate PDF documents online with advanced search and zoom features.",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/20",
    popular: false,
    ready: false,
  },
  {
    name: "PDF Editor",
    href: "/pdf-editor",
    icon: Edit,
    description: "Edit text, add annotations, fill forms, and add digital signatures to PDF documents.",
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    borderColor: "border-red-400/20",
    popular: false,
    ready: false,
  },
]

export default function PDFToolsOverview() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const readyTools = pdfTools.filter((tool) => tool.ready)
  const comingSoonTools = pdfTools.filter((tool) => !tool.ready)

  return (
    <>
      {/* Schema Markup */}
      <Script id="pdf-tools-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "PDF Tools Suite",
          description:
            "Complete PDF tools suite including generator, merger, splitter, compressor, converter, viewer, and editor. Professional PDF processing online.",
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/pdf-tools`,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: [
            "PDF generation",
            "PDF merging",
            "PDF splitting",
            "PDF compression",
            "PDF conversion",
            "PDF viewing",
            "PDF editing",
          ],
        })}
      </Script>

      <div className="space-y-8">
        {/* Hero Section */}
        <Card className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-pink-500/10 border-red-500/20">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Complete PDF Tools Suite</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
              Everything you need to work with PDF documents. Generate, merge, split, compress, convert, view, and edit
              PDFs with professional-grade tools.
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-muted-foreground">Secure Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-muted-foreground">Fast & Reliable</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-muted-foreground">Trusted by Professionals</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Tools */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-red-400" />
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
                            <Badge className="bg-red-400/20 text-red-600 dark:text-red-400 text-xs">Popular</Badge>
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
            <FileText className="w-5 h-5 text-orange-400" />
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
            <CardTitle className="text-foreground text-center">Why Choose Our PDF Tools?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">
                  Your documents are processed securely with no server storage or data collection.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Professional Quality</h3>
                <p className="text-sm text-muted-foreground">
                  Industry-standard PDF processing with high-quality output and formatting preservation.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Easy to Use</h3>
                <p className="text-sm text-muted-foreground">
                  Intuitive interfaces designed for both beginners and professionals.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
