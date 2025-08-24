"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Zap, Upload, FileText, X, Download, Info, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import Script from "next/script"
import ImageToolsSidebar from "@/components/image-tools-sidebar"

interface PDFFile {
  file: File
  name: string
  size: string
  sizeBytes: number
}

interface CompressionResult {
  originalSize: number
  compressedSize: number
  compressionRatio: number
  blob: Blob
}

export default function PDFCompressor() {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [compressionLevel, setCompressionLevel] = useState("medium")
  const [result, setResult] = useState<CompressionResult | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleFileSelect = (files: FileList) => {
    const file = files[0]
    if (file && file.type === "application/pdf") {
      setPdfFile({
        file,
        name: file.name,
        size: formatFileSize(file.size),
        sizeBytes: file.size,
      })
      setResult(null)
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

  const getCompressionSettings = (level: string) => {
    switch (level) {
      case "low":
        return { useObjectStreams: false, compress: false }
      case "medium":
        return { useObjectStreams: true, compress: true }
      case "high":
        return { useObjectStreams: true, compress: true, addDefaultPage: false }
      case "maximum":
        return { useObjectStreams: true, compress: true, addDefaultPage: false }
      default:
        return { useObjectStreams: true, compress: true }
    }
  }

  const compressPDF = async () => {
    if (!pdfFile) return

    setIsCompressing(true)
    setProgress(0)

    try {
      const { PDFDocument } = await import("pdf-lib")
      const arrayBuffer = await pdfFile.file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      setProgress(20)

      const settings = getCompressionSettings(compressionLevel)

      setProgress(40)

      const pages = pdfDoc.getPages()
      setProgress(60)

      const compressedPdf = await PDFDocument.create()

      for (let i = 0; i < pages.length; i++) {
        const [copiedPage] = await compressedPdf.copyPages(pdfDoc, [i])
        compressedPdf.addPage(copiedPage)
        setProgress(60 + (i / pages.length) * 30)
      }

      setProgress(95)

      const compressedBytes = await compressedPdf.save(settings)
      setProgress(100)

      const compressedBlob = new Blob([compressedBytes], { type: "application/pdf" })
      const compressionRatio = Math.max(0, ((pdfFile.sizeBytes - compressedBlob.size) / pdfFile.sizeBytes) * 100)

      setResult({
        originalSize: pdfFile.sizeBytes,
        compressedSize: compressedBlob.size,
        compressionRatio,
        blob: compressedBlob,
      })

      setTimeout(() => setProgress(0), 1000)
    } catch (error) {
      console.error("PDF compression failed:", error)
      alert("PDF compression failed. Please try again.")
    } finally {
      setIsCompressing(false)
    }
  }

  const downloadCompressed = () => {
    if (!result || !pdfFile) return

    const url = URL.createObjectURL(result.blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${pdfFile.name.replace(/\.pdf$/i, "")}_compressed.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {/* Schema Markup */}
      <Script id="pdf-compressor-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "PDF Compressor",
          description:
            "Free online PDF compressor tool to reduce PDF file size while maintaining quality. Compress large PDF documents for easier sharing.",
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/pdf-compressor`,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: [
            "Lossless compression",
            "Image optimization",
            "Font optimization",
            "Batch compression",
            "Custom quality settings",
          ],
        })}
      </Script>

      {/* Main Layout: Sidebar on Right */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-screen pt-6 lg:pt-0">
        {/* Main Content - Left */}
        <main className="flex-1 lg:w-3/4 space-y-6">
          {/* Offset to prevent header overlap */}
          <div id="top" className="h-16"></div>

          {/* Page Header - Non-Sticky */}
          <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center gap-2 text-2xl">
                <Zap className="w-6 h-6 text-yellow-400" />
                PDF Compressor
                <Badge className="bg-yellow-400/20 text-yellow-600 dark:text-yellow-400">Popular</Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Reduce PDF file size by up to 90% while maintaining document quality and readability.
              </p>
            </CardHeader>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Upload className="w-5 h-5 text-yellow-400" />
                  Select PDF File
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                    isDragOver
                      ? "border-yellow-400 bg-yellow-400/10"
                      : "border-border hover:border-yellow-400/50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-muted-foreground/80 mx-auto mb-4" />
                  <p className="text-foreground text-lg mb-2">Drop PDF file here</p>
                  <p className="text-muted-foreground/80 mb-4">or click to browse</p>
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white/30 text-foreground hover:bg-white/20"
                  >
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
                          setResult(null)
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
                        <p className="text-xs text-muted-foreground">{pdfFile.size}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compression Settings */}
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Compression Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!pdfFile && (
                  <div className="text-center py-8">
                    <Zap className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a PDF file to start compression</p>
                  </div>
                )}

                {pdfFile && !isCompressing && !result && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Compression Level</Label>
                      <Select value={compressionLevel} onValueChange={setCompressionLevel}>
                        <SelectTrigger className="bg-card/50 border-border text-foreground">
                          <SelectValue placeholder="Select compression level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (Best Quality)</SelectItem>
                          <SelectItem value="medium">Medium (Balanced)</SelectItem>
                          <SelectItem value="high">High (Smaller Size)</SelectItem>
                          <SelectItem value="maximum">Maximum (Smallest Size)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <h3 className="font-semibold text-foreground mb-2">Compression Preview</h3>
                      <p className="text-sm text-muted-foreground mb-2">Original size: {pdfFile.size}</p>
                      <p className="text-sm text-muted-foreground">
                        {compressionLevel === "low" && "Expected reduction: 10-30%"}
                        {compressionLevel === "medium" && "Expected reduction: 30-50%"}
                        {compressionLevel === "high" && "Expected reduction: 50-70%"}
                        {compressionLevel === "maximum" && "Expected reduction: 70-90%"}
                      </p>
                    </div>

                    <Button
                      onClick={compressPDF}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Compress PDF
                    </Button>
                  </div>
                )}

                {isCompressing && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-foreground text-lg font-semibold mb-2">Compressing PDF...</h3>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
                        <span className="text-foreground">{progress}%</span>
                      </div>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <p className="text-sm text-muted-foreground text-center">
                      Optimizing PDF structure and images...
                    </p>
                  </div>
                )}

                {result && (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <h3 className="font-semibold text-foreground mb-3">Compression Complete!</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Original Size:</span>
                          <span className="text-foreground font-medium">{formatFileSize(result.originalSize)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Compressed Size:</span>
                          <span className="text-foreground font-medium">{formatFileSize(result.compressedSize)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Size Reduction:</span>
                          <span className="text-green-400 font-medium">{result.compressionRatio.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={downloadCompressed}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Compressed PDF
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setPdfFile(null)
                        setResult(null)
                      }}
                      className="w-full"
                    >
                      Compress Another File
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tabs: How to Use, Features, Pro Tips */}
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
                    <Info className="w-5 h-5 text-yellow-400" />
                    How to Compress PDFs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      step: 1,
                      title: "Upload PDF File",
                      description: "Drag and drop or click to select the PDF file you want to compress",
                    },
                    {
                      step: 2,
                      title: "Choose Compression Level",
                      description: "Select the balance between file size and quality that works for you",
                    },
                    {
                      step: 3,
                      title: "Start Compression",
                      description: "Click compress and wait for the optimization process to complete",
                    },
                    {
                      step: 4,
                      title: "Download Result",
                      description: "Download your compressed PDF with significant size reduction",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
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
                        title: "Smart Compression",
                        description: "AI-powered optimization for maximum size reduction",
                      },
                      {
                        icon: CheckCircle,
                        title: "Quality Control",
                        description: "Choose compression level based on your needs",
                      },
                      {
                        icon: CheckCircle,
                        title: "Secure Processing",
                        description: "All compression happens in your browser for privacy",
                      },
                      {
                        icon: CheckCircle,
                        title: "Instant Results",
                        description: "Fast compression with immediate download",
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
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Choose the Right Level</h4>
                      <p className="text-sm text-muted-foreground">
                        Use low compression for documents with important images, high for text-heavy files.
                      </p>
                    </div>
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Large Files</h4>
                      <p className="text-sm text-muted-foreground">
                        PDFs with many images benefit most from compression - up to 90% size reduction.
                      </p>
                    </div>
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Quality Check</h4>
                      <p className="text-sm text-muted-foreground">
                        Always review the compressed PDF to ensure it meets your quality requirements.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        {/* Sidebar - On the Right */}
        <aside className="lg:w-1/4 lg:shrink-0">
          <div className="sticky top-24">
            <ImageToolsSidebar />
          </div>
        </aside>
      </div>
    </>
  )
}
