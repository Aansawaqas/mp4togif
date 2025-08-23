"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FileText,
  FilePlus,
  Merge,
  Split,
  Zap,
  FileImage,
  Eye,
  Edit,
  Sparkles,
  Type,
  Ligature as Signature,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const pdfTools = [
  {
    name: "PDF Generator",
    href: "/pdf-generator",
    icon: FilePlus,
    description: "Create PDFs from text, images, and HTML",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    popular: true,
    ready: true,
  },
  {
    name: "PDF Merger",
    href: "/pdf-merger",
    icon: Merge,
    description: "Combine multiple PDFs into one document",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    popular: true,
    ready: true,
  },
  {
    name: "PDF Splitter",
    href: "/pdf-splitter",
    icon: Split,
    description: "Split PDF into individual pages or ranges",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    popular: false,
    ready: true,
  },
  {
    name: "PDF Compressor",
    href: "/pdf-compressor",
    icon: Zap,
    description: "Reduce PDF file size while maintaining quality",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    popular: true,
    ready: true,
  },
  {
    name: "PDF to Image",
    href: "/pdf-to-image",
    icon: FileImage,
    description: "Convert PDF pages to high-quality images",
    color: "text-pink-400",
    bgColor: "bg-pink-400/10",
    popular: false,
    ready: true,
  },
  {
    name: "Image to PDF",
    href: "/image-to-pdf",
    icon: FileText,
    description: "Convert images to PDF documents",
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    popular: false,
    ready: true,
  },
  {
    name: "PDF Viewer",
    href: "/pdf-viewer",
    icon: Eye,
    description: "View and navigate PDF documents online",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    popular: false,
    ready: true,
  },
  {
    name: "PDF Editor",
    href: "/pdf-editor",
    icon: Edit,
    description: "Edit text, add annotations, and modify PDFs",
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    popular: false,
    ready: true,
  },
  {
    name: "PDF Form Filler",
    href: "/pdf-form-filler",
    icon: Type,
    description: "Fill and submit PDF forms digitally",
    color: "text-indigo-400",
    bgColor: "bg-indigo-400/10",
    popular: false,
    ready: false,
  },
  {
    name: "PDF Signature",
    href: "/pdf-signature",
    icon: Signature,
    description: "Add digital signatures to PDFs",
    color: "text-violet-400",
    bgColor: "bg-violet-400/10",
    popular: false,
    ready: false,
  },
]

export default function PDFToolsSidebar() {
  const pathname = usePathname()
  const readyTools = pdfTools.filter((tool) => tool.ready)
  const totalTools = pdfTools.length
  const completionPercentage = (readyTools.length / totalTools) * 100

  return (
    <Card className="bg-card/50 backdrop-blur-lg border-border sticky top-24">
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-400" />
            PDF Tools
          </h2>
          <p className="text-sm text-muted-foreground">Complete PDF processing toolkit</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">Tools Ready</span>
            <span className="text-sm text-muted-foreground">
              {readyTools.length}/{totalTools}
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Available Tools */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Available Now
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {readyTools.map((tool) => (
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
                      className={`font-medium text-sm ${pathname === tool.href ? "text-primary" : "text-foreground"}`}
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
        </div>

        {/* Coming Soon */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            Coming Soon
          </h3>
          <div className="space-y-2">
            {pdfTools
              .filter((tool) => !tool.ready)
              .map((tool) => (
                <div key={tool.href} className="flex items-center gap-3 p-3 rounded-lg opacity-60 cursor-not-allowed">
                  <div className={`w-8 h-8 ${tool.bgColor} rounded-lg flex items-center justify-center`}>
                    <tool.icon className={`w-4 h-4 ${tool.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm text-foreground">{tool.name}</span>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{tool.description}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="pt-6 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">Quick Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Tools</span>
              <span className="text-foreground font-medium">{totalTools}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Processing</span>
              <span className="text-green-400 font-medium">Client & Server</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">File Limit</span>
              <span className="text-green-400 font-medium">100MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Security</span>
              <span className="text-green-400 font-medium">Encrypted</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
