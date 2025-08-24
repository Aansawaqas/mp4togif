"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { FileImage, Upload, FileText, X, Download, Info, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import Script from "next/script"
import ImageToolsSidebar from "@/components/image-tools-sidebar"

interface PDFFile {
  file: File
  name: string
  size: string
  pageCount?: number
}

interface ConvertedImage {
  pageNumber: number
  blob: Blob
  url: string
}

export default function PDFToImage() {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [format, setFormat] = useState("png")
  const [quality, setQuality] = useState("high")
  const [pageRange, setPageRange] = useState("all")
  const [customPages, setCustomPages] = useState("")
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      try {
        // Get page count using pdf-lib (lighter than pdfjs for just counting)
        const { PDFDocument } = await import("pdf-lib")
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const pageCount = pdfDoc.getPageCount()

        setPdfFile({
          file,
          name: file.name,
          size: formatFileSize(file.size),
          pageCount,
        })
        setConvertedImages([])
      } catch (error) {
        console.error("Error loading PDF:", error)
        alert("Error loading PDF. Please try a different file.")
      }
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const getQualitySettings = (quality: string) => {
    switch (quality) {
      case "low":
        return { scale: 1.0, quality: 0.6 }
      case "medium":
        return { scale: 1.5, quality: 0.8 }
      case "high":
        return { scale: 2.0, quality: 0.9 }
      case "ultra":
        return { scale: 3.0, quality: 1.0 }
      default:
        return { scale: 2.0, quality: 0.9 }
    }
  }

  const parsePageRange = (range: string, totalPages: number): number[] => {
    if (range === "all") {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: number[] = []
    const parts = range.split(",").map((part) => part.trim())

    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map((num) => Number.parseInt(num.trim()))
        if (start >= 1 && end <= totalPages && start <= end) {
          for (let i = start; i <= end; i++) {
            pages.push(i)
          }
        }
      } else {
        const page = Number.parseInt(part)
        if (page >= 1 && page <= totalPages) {
          pages.push(page)
        }
      }
    }

    return [...new Set(pages)].sort((a, b) => a - b)
  }

  const convertToImages = async () => {
    if (!pdfFile) return

    setIsConverting(true)
    setProgress(0)
    setConvertedImages([])

    try {
      // Dynamic import of pdfjs-dist
      const pdfjsLib = await import("pdfjs-dist")

      // Set worker source - using a CDN version that should work
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js  `

      const arrayBuffer = await pdfFile.file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      const settings = getQualitySettings(quality)
      const pagesToConvert =
        pageRange === "all"
          ? parsePageRange("all", pdfFile.pageCount || 0)
          : parsePageRange(customPages, pdfFile.pageCount || 0)

      const images: ConvertedImage[] = []

      for (let i = 0; i < pagesToConvert.length; i++) {
        const pageNum = pagesToConvert[i]
        setProgress((i / pagesToConvert.length) * 90)

        try {
          const page = await pdf.getPage(pageNum)
          const viewport = page.getViewport({ scale: settings.scale })

          // Create canvas
          const canvas = document.createElement("canvas")
          const context = canvas.getContext("2d")!
          canvas.height = viewport.height
          canvas.width = viewport.width

          // Render page to canvas
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise

          // Convert to blob
          const blob = await new Promise<Blob>((resolve) => {
            if (format === "jpeg" || format === "jpg") {
              canvas.toBlob((blob) => resolve(blob!), "image/jpeg", settings.quality)
            } else if (format === "webp") {
              canvas.toBlob((blob) => resolve(blob!), "image/webp", settings.quality)
            } else {
              canvas.toBlob((blob) => resolve(blob!), "image/png")
            }
          })

          const url = URL.createObjectURL(blob)
          images.push({
            pageNumber: pageNum,
            blob,
            url,
          })
        } catch (pageError) {
          console.error(`Error converting page ${pageNum}:`, pageError)
        }
      }

      setProgress(100)
      setConvertedImages(images)
      setTimeout(() => setProgress(0), 1000)
    } catch (error) {
      console.error("PDF to image conversion failed:", error)
      alert("PDF to image conversion failed. Please try again.")
    } finally {
      setIsConverting(false)
    }
  }

  const downloadImage = (image: ConvertedImage) => {
    const a = document.createElement("a")
    a.href = image.url
    a.download = `${pdfFile?.name.replace(".pdf", "")}_page_${image.pageNumber}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const downloadAllImages = () => {
    convertedImages.forEach((image, index) => {
      setTimeout(() => {
        downloadImage(image)
      }, index * 200) // Stagger downloads
    })
  }

  return (
    <>
      {/* Schema Markup */}
      <Script id="pdf-to-image-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "PDF to Image Converter",
          description:
            "Free online PDF to image converter tool. Convert PDF pages to high-quality JPEG, PNG, or WebP images.",
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/pdf-to-image`,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: [
            "Multiple image formats",
            "High resolution output",
            "Batch conversion",
            "Custom DPI settings",
            "Page range selection",
          ],
        })}
      </Script>

      {/* Main Layout: Sidebar on Right */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-screen pt-6 lg:pt-0">
        {/* Main Content - Left */}
        <main className="flex-1 lg:w-3/4 space-y-6">
          {/* Offset to prevent header overlap */}
          <div id="top" className="h-16"></div>

          {/* Header - Non-Sticky */}
          <Card className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 border-pink-500/20">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2 text-2xl">
                <FileImage className="w-6 h-6 text-pink-400" />
                PDF to Image Converter
                <Badge className="bg-pink-400/20 text-pink-600 dark:text-pink-400">Popular</Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Convert PDF pages to high-quality images in JPEG, PNG, or WebP format with custom resolution settings.
              </p>
            </CardHeader>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Upload className="w-5 h-5 text-pink-400" />
                  Select PDF File
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                    isDragOver ? "border-pink-400 bg-pink-400/10" : "border-border hover:border-pink-400/50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-muted-foreground/80 mx-auto mb-4" />
                  <p className="text-foreground text-lg mb-2">Drop PDF file here</p>
                  <p className="text-muted-foreground/80 mb-4">or click to browse</p>
                  <Button variant="outline" className="bg-white/10 border-white/30 text-foreground hover:bg-white/20">
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

                {pdfFile && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground">Selected File</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPdfFile(null)
                          setConvertedImages([])
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-card/30 rounded-lg border border-border">
                      <div className="w-10 h-10 bg-red-500/20 rounded flex items-center justify-center">
                        <FileText className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{pdfFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {pdfFile.size} • {pdfFile.pageCount} pages
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conversion Settings */}
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Conversion Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!pdfFile && (
                  <div className="text-center py-8">
                    <FileImage className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a PDF file to start conversion</p>
                  </div>
                )}

                {pdfFile && !isConverting && convertedImages.length === 0 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Output Format</Label>
                      <Select value={format} onValueChange={setFormat}>
                        <SelectTrigger className="bg-card/50 border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="png">PNG (Best Quality)</SelectItem>
                          <SelectItem value="jpeg">JPEG (Smaller Size)</SelectItem>
                          <SelectItem value="webp">WebP (Modern Format)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Image Quality</Label>
                      <Select value={quality} onValueChange={setQuality}>
                        <SelectTrigger className="bg-card/50 border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (72 DPI)</SelectItem>
                          <SelectItem value="medium">Medium (150 DPI)</SelectItem>
                          <SelectItem value="high">High (300 DPI)</SelectItem>
                          <SelectItem value="ultra">Ultra (450 DPI)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Pages to Convert</Label>
                      <Select value={pageRange} onValueChange={setPageRange}>
                        <SelectTrigger className="bg-card/50 border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Pages</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {pageRange === "custom" && (
                      <div className="space-y-2">
                        <Label className="text-foreground">Page Range</Label>
                        <Input
                          value={customPages}
                          onChange={(e) => setCustomPages(e.target.value)}
                          placeholder="e.g., 1-3, 5, 7-10"
                          className="bg-card/50 border-border text-foreground"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter page numbers separated by commas. Use dashes for ranges.
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={convertToImages}
                      disabled={pageRange === "custom" && !customPages.trim()}
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold"
                    >
                      <FileImage className="w-4 h-4 mr-2" />
                      Convert to Images
                    </Button>
                  </div>
                )}

                {isConverting && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-foreground text-lg font-semibold mb-2">Converting PDF...</h3>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                        <span className="text-foreground">{progress}%</span>
                      </div>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <p className="text-sm text-muted-foreground text-center">
                      Converting pages to {format.toUpperCase()} images...
                    </p>
                  </div>
                )}

                {convertedImages.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">Converted Images ({convertedImages.length})</h3>
                      <Button
                        onClick={downloadAllImages}
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download All
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {convertedImages.map((image) => (
                        <div key={image.pageNumber} className="relative group">
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={`Page ${image.pageNumber}`}
                            className="w-full h-24 object-cover rounded-lg border border-border"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Button
                              size="sm"
                              onClick={() => downloadImage(image)}
                              className="bg-white/20 hover:bg-white/30"
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                          <Badge className="absolute top-1 left-1 bg-pink-500/80 text-white text-xs">
                            Page {image.pageNumber}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setPdfFile(null)
                        setConvertedImages([])
                      }}
                      className="w-full"
                    >
                      Convert Another File
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

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
                    <Info className="w-5 h-5 text-pink-400" />
                    How to Convert PDF to Images
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    {[
                      {
                        step: 1,
                        title: "Upload PDF File",
                        description: "Drag and drop or click to select the PDF file you want to convert",
                      },
                      {
                        step: 2,
                        title: "Choose Settings",
                        description: "Select output format, quality, and which pages to convert",
                      },
                      {
                        step: 3,
                        title: "Start Conversion",
                        description: "Click convert and wait for the pages to be processed into images",
                      },
                      {
                        step: 4,
                        title: "Download Images",
                        description: "Download individual images or all at once with one click",
                      },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
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
                        title: "Multiple Formats",
                        description: "Export as PNG, JPEG, or WebP images",
                      },
                      {
                        icon: CheckCircle,
                        title: "High Resolution",
                        description: "Custom DPI settings up to 450 DPI for print quality",
                      },
                      {
                        icon: CheckCircle,
                        title: "Page Selection",
                        description: "Convert specific pages or entire documents",
                      },
                      {
                        icon: CheckCircle,
                        title: "Batch Download",
                        description: "Download all converted images with one click",
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
                    <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Format Selection</h4>
                      <p className="text-sm text-muted-foreground">
                        Use PNG for documents with text, JPEG for photos, WebP for web use.
                      </p>
                    </div>
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Quality Settings</h4>
                      <p className="text-sm text-muted-foreground">
                        Higher DPI settings create larger files but better quality for printing.
                      </p>
                    </div>
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Page Ranges</h4>
                      <p className="text-sm text-muted-foreground">
                        Convert only the pages you need to save time and storage space.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        {/* Sidebar - Right Side */}
        <aside className="lg:w-1/4 lg:shrink-0">
          <div className="sticky top-24">
            <ImageToolsSidebar />
          </div>
        </aside>
      </div>
    </>
  )
}
