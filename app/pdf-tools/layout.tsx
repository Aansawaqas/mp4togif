"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, FilePlus, Merge, Split, Zap, FileImage, Eye, Edit, ArrowLeft, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const pdfTools = [
  {
    name: "PDF Generator",
    href: "/pdf-generator",
    icon: FilePlus,
    description: "Create PDFs from text, images, and HTML",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    popular: true,
  },
  {
    name: "PDF Merger",
    href: "/pdf-merger",
    icon: Merge,
    description: "Combine multiple PDFs into one document",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    popular: true,
  },
  {
    name: "PDF Splitter",
    href: "/pdf-splitter",
    icon: Split,
    description: "Split PDF into individual pages or ranges",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    popular: false,
  },
  {
    name: "PDF Compressor",
    href: "/pdf-compressor",
    icon: Zap,
    description: "Reduce PDF file size while maintaining quality",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    popular: true,
  },
  {
    name: "PDF to Image",
    href: "/pdf-to-image",
    icon: FileImage,
    description: "Convert PDF pages to high-quality images",
    color: "text-pink-400",
    bgColor: "bg-pink-400/10",
    popular: false,
  },
  {
    name: "Image to PDF",
    href: "/image-to-pdf",
    icon: FileText,
    description: "Convert images to PDF documents",
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    popular: false,
  },
  {
    name: "PDF Viewer",
    href: "/pdf-viewer",
    icon: Eye,
    description: "View and navigate PDF documents online",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    popular: false,
  },
  {
    name: "PDF Editor",
    href: "/pdf-editor",
    icon: Edit,
    description: "Edit text, add annotations, and modify PDFs",
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    popular: false,
  },
]

interface PDFToolsLayoutProps {
  children: ReactNode
}

export default function PDFToolsLayout({ children }: PDFToolsLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background pt-40">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">PDF Tools Suite</h1>
              <p className="text-muted-foreground text-sm">Complete PDF processing toolkit</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-card/50 backdrop-blur-lg border-border sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-red-400" />
                  PDF Tools
                </h2>
                <div className="space-y-2">
                  {pdfTools.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group ${
                        pathname === tool.href ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary/50"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 ${tool.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                      >
                        <tool.icon className={`w-5 h-5 ${tool.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium text-sm ${
                              pathname === tool.href ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {tool.name}
                          </span>
                          {tool.popular && (
                            <Badge variant="secondary" className="text-xs bg-red-400/20 text-red-600 dark:text-red-400">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tool.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Quick Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tools Available</span>
                      <span className="text-foreground font-medium">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Processing</span>
                      <span className="text-green-400 font-medium">Client & Server</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Limit</span>
                      <span className="text-green-400 font-medium">100MB</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>
    </div>
  )
}
