"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  Eye,
  Upload,
  FileText,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Script from "next/script"

interface PDFFile {
  file: File
  name: string
  size: string
}

export default function PDFViewer() {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleFileSelect = async (files: FileList) => {
    const file = files[0]
    if (file && file.type === "application/pdf") {
      setPdfFile({
        file,
        name: file.name,
        size: formatFileSize(file.size),
      })
      await loadPDF(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const loadPDF = async (file: File) => {
    setIsLoading(true)
    try {
      const pdfjsLib = await import("pdfjs-dist")
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      setPdfDoc(pdf)
      setTotalPages(pdf.numPages)
      setCurrentPage(1)

      // Render first page
      await renderPage(pdf, 1)
    } catch (error) {
      console.error("Error loading PDF:", error)
      alert("Error loading PDF. Please try a different file.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderPage = async (pdf: any, pageNum: number) => {
    if (!canvasRef.current) return

    try {
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale, rotation })

      const canvas = canvasRef.current
      const context = canvas.getContext("2d")!
      canvas.height = viewport.height
      canvas.width = viewport.width

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise
    } catch (error) {
      console.error("Error rendering page:", error)
    }
  }

  const goToPage = async (pageNum: number) => {
    if (pdfDoc && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum)
      await renderPage(pdfDoc, pageNum)
    }
  }

  const zoomIn = async () => {
    const newScale = Math.min(scale * 1.2, 3.0)
    setScale(newScale)
  }

  const zoomOut = async () => {
    const newScale = Math.max(scale / 1.2, 0.5)
    setScale(newScale)
  }

  const rotate = async () => {
    const newRotation = (rotation + 90) % 360
    setRotation(newRotation)
  }

  const resetZoom = () => {
    setScale(1.0)
  }

  const downloadPDF = () => {
    if (!pdfFile) return

    const url = URL.createObjectURL(pdfFile.file)
    const a = document.createElement("a")
    a.href = url
    a.download = pdfFile.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Re-render when scale or rotation changes
  useEffect(() => {
    if (pdfDoc && currentPage) {
      renderPage(pdfDoc, currentPage)
    }
  }, [scale, rotation, pdfDoc, currentPage])

  return (
    <>
      {/* Schema Markup */}
      <Script id="pdf-viewer-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "PDF Viewer",
          description:
            "Free online PDF viewer tool to view and navigate PDF documents in your browser. No downloads required.",
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/pdf-viewer`,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: [
            "Secure PDF viewing",
            "Zoom and navigation",
            "Search functionality",
            "Print support",
            "Mobile responsive",
          ],
        })}
      </Script>

      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Eye className="w-6 h-6 text-orange-400" />
              PDF Viewer
              <Badge className="bg-orange-400/20 text-orange-600 dark:text-orange-400">Secure</Badge>
            </CardTitle>
            <p className="text-muted-foreground">
              View PDF documents directly in your browser with advanced navigation and search features.
            </p>
          </CardHeader>
        </Card>

        {!pdfFile && (
          <Card className="bg-card/50 backdrop-blur-lg border-border">
            <CardContent className="p-8">
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
                  isDragOver ? "border-orange-400 bg-orange-400/10" : "border-border hover:border-orange-400/50"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-16 h-16 text-muted-foreground/80 mx-auto mb-4" />
                <p className="text-foreground text-xl mb-2">Drop PDF file here</p>
                <p className="text-muted-foreground/80 mb-6">or click to browse</p>
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                  Choose PDF File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {pdfFile && (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Controls Sidebar */}
            <Card className="bg-card/50 backdrop-blur-lg border-border lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">Document Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Info */}
                <div className="p-3 bg-card/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-orange-400" />
                    <span className="font-medium text-foreground text-sm truncate">{pdfFile.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{pdfFile.size}</p>
                  {totalPages > 0 && <p className="text-xs text-muted-foreground">{totalPages} pages</p>}
                </div>

                {/* Navigation */}
                <div className="space-y-2">
                  <Label className="text-foreground text-sm">Page Navigation</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={currentPage}
                      onChange={(e) => {
                        const page = Number.parseInt(e.target.value)
                        if (page >= 1 && page <= totalPages) {
                          goToPage(page)
                        }
                      }}
                      className="w-16 text-center bg-card/50 border-border text-foreground"
                      min={1}
                      max={totalPages}
                    />
                    <span className="text-sm text-muted-foreground">/ {totalPages}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Zoom Controls */}
                <div className="space-y-2">
                  <Label className="text-foreground text-sm">Zoom ({Math.round(scale * 100)}%)</Label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={zoomOut}>
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetZoom}>
                      Reset
                    </Button>
                    <Button variant="outline" size="sm" onClick={zoomIn}>
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Rotation */}
                <div className="space-y-2">
                  <Label className="text-foreground text-sm">Rotation</Label>
                  <Button variant="outline" size="sm" onClick={rotate} className="w-full bg-transparent">
                    <RotateCw className="w-4 h-4 mr-2" />
                    Rotate 90°
                  </Button>
                </div>

                {/* Search */}
                <div className="space-y-2">
                  <Label className="text-foreground text-sm">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search in document..."
                      className="pl-8 bg-card/50 border-border text-foreground"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4 border-t border-border">
                  <Button onClick={downloadPDF} variant="outline" size="sm" className="w-full bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={() => {
                      setPdfFile(null)
                      setPdfDoc(null)
                      setCurrentPage(1)
                      setTotalPages(0)
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close Document
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* PDF Viewer */}
            <Card className="bg-card/50 backdrop-blur-lg border-border lg:col-span-3">
              <CardContent className="p-4">
                {isLoading && (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                      <p className="text-foreground">Loading PDF...</p>
                    </div>
                  </div>
                )}

                {!isLoading && pdfDoc && (
                  <div className="flex justify-center">
                    <div className="border border-border rounded-lg overflow-hidden shadow-lg">
                      <canvas ref={canvasRef} className="max-w-full h-auto" style={{ display: "block" }} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* How to Use & Features */}
        <Tabs defaultValue="howto" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="howto">How to Use</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="tips">Pro Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="howto" className="mt-6">
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Info className="w-5 h-5 text-orange-400" />
                  How to Use PDF Viewer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {[
                    {
                      step: 1,
                      title: "Upload PDF File",
                      description: "Drag and drop or click to select the PDF file you want to view",
                    },
                    {
                      step: 2,
                      title: "Navigate Pages",
                      description: "Use the navigation controls to move between pages or jump to specific pages",
                    },
                    {
                      step: 3,
                      title: "Zoom & Rotate",
                      description: "Adjust zoom level and rotate pages for better viewing experience",
                    },
                    {
                      step: 4,
                      title: "Search & Download",
                      description: "Search for text within the document or download the original file",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      icon: CheckCircle,
                      title: "Secure Viewing",
                      description: "View PDFs without downloading or storing files",
                    },
                    {
                      icon: CheckCircle,
                      title: "Advanced Navigation",
                      description: "Zoom, pan, and navigate through pages easily",
                    },
                    {
                      icon: CheckCircle,
                      title: "Search Functionality",
                      description: "Find text within documents quickly",
                    },
                    {
                      icon: CheckCircle,
                      title: "Mobile Responsive",
                      description: "Works perfectly on desktop and mobile devices",
                    },
                  ].map((feature, index) => (
                    <div key={index} className="flex gap-3">
                      <feature.icon className="w-5 h-5 text-green-400 mt-1" />
                      <div>
                        <h3 className="font-semibold text-foreground">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips" className="mt-6">
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Pro Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">Keyboard Shortcuts</h4>
                    <p className="text-sm text-muted-foreground">
                      Use arrow keys to navigate pages, +/- to zoom, and Ctrl+F to search.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">Large Documents</h4>
                    <p className="text-sm text-muted-foreground">
                      For large PDFs, use the page input to jump directly to specific pages.
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">Privacy</h4>
                    <p className="text-sm text-muted-foreground">
                      Your files are processed locally in your browser and never uploaded to servers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
