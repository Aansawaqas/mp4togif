"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Split, Upload, FileText, X, Info, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import Script from "next/script"

interface PDFFile {
  file: File
  name: string
  size: string
  pageCount?: number
}

export default function PDFSplitter() {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null)
  const [isSplitting, setIsSplitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [splitMode, setSplitMode] = useState<"pages" | "ranges">("pages")
  const [pageRanges, setPageRanges] = useState("")
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
        // Dynamic import of pdf-lib
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
      } catch (error) {
        console.error("Error loading PDF:", error)
        alert("Error loading PDF. Please try a different file.")
      }
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

  const parsePageRanges = (ranges: string, totalPages: number): number[][] => {
    const validRanges: number[][] = []
    const parts = ranges.split(",").map((part) => part.trim())

    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map((num) => Number.parseInt(num.trim()))
        if (start >= 1 && end <= totalPages && start <= end) {
          validRanges.push([start - 1, end - 1]) // Convert to 0-based indexing
        }
      } else {
        const page = Number.parseInt(part)
        if (page >= 1 && page <= totalPages) {
          validRanges.push([page - 1, page - 1]) // Single page range
        }
      }
    }

    return validRanges
  }

  const splitPDF = async () => {
    if (!pdfFile) return

    setIsSplitting(true)
    setProgress(0)

    try {
      const { PDFDocument } = await import("pdf-lib")
      const arrayBuffer = await pdfFile.file.arrayBuffer()
      const sourcePdf = await PDFDocument.load(arrayBuffer)
      const totalPages = sourcePdf.getPageCount()

      if (splitMode === "pages") {
        // Split into individual pages
        for (let i = 0; i < totalPages; i++) {
          setProgress((i / totalPages) * 90)

          const newPdf = await PDFDocument.create()
          const [copiedPage] = await newPdf.copyPages(sourcePdf, [i])
          newPdf.addPage(copiedPage)

          const pdfBytes = await newPdf.save()
          const blob = new Blob([pdfBytes], { type: "application/pdf" })
          const url = URL.createObjectURL(blob)

          const a = document.createElement("a")
          a.href = url
          a.download = `${pdfFile.name.replace(".pdf", "")}_page_${i + 1}.pdf`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)

          // Small delay to prevent browser blocking
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      } else {
        // Split by ranges
        const ranges = parsePageRanges(pageRanges, totalPages)

        for (let i = 0; i < ranges.length; i++) {
          setProgress((i / ranges.length) * 90)

          const [startPage, endPage] = ranges[i]
          const newPdf = await PDFDocument.create()

          const pageIndices = []
          for (let j = startPage; j <= endPage; j++) {
            pageIndices.push(j)
          }

          const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices)
          copiedPages.forEach((page) => newPdf.addPage(page))

          const pdfBytes = await newPdf.save()
          const blob = new Blob([pdfBytes], { type: "application/pdf" })
          const url = URL.createObjectURL(blob)

          const a = document.createElement("a")
          a.href = url
          a.download = `${pdfFile.name.replace(".pdf", "")}_pages_${startPage + 1}-${endPage + 1}.pdf`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)

          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      setProgress(100)
      setTimeout(() => {
        setProgress(0)
        alert("PDF split successfully! Check your downloads folder.")
      }, 1000)
    } catch (error) {
      console.error("PDF split failed:", error)
      alert("PDF split failed. Please try again.")
    } finally {
      setIsSplitting(false)
    }
  }

  return (
    <>
      {/* Schema Markup */}
      <Script id="pdf-splitter-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "PDF Splitter",
          description:
            "Free online PDF splitter tool to split PDF files into individual pages or custom ranges. Extract pages from PDF documents.",
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/pdf-splitter`,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: [
            "Split by page ranges",
            "Extract individual pages",
            "Batch page extraction",
            "Custom split options",
            "High quality output",
          ],
        })}
      </Script>

      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Split className="w-6 h-6 text-purple-400" />
              PDF Splitter
              <Badge className="bg-purple-400/20 text-purple-600 dark:text-purple-400">Popular</Badge>
            </CardTitle>
            <p className="text-muted-foreground">
              Split PDF documents into individual pages or custom page ranges with precision control.
            </p>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="bg-card/50 backdrop-blur-lg border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-400" />
                Select PDF File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                  isDragOver ? "border-purple-400 bg-purple-400/10" : "border-border hover:border-purple-400/50"
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
                      onClick={() => setPdfFile(null)}
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

          {/* Split Options */}
          <Card className="bg-card/50 backdrop-blur-lg border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Split Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!pdfFile && (
                <div className="text-center py-8">
                  <Split className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a PDF file to start splitting</p>
                </div>
              )}

              {pdfFile && !isSplitting && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-foreground">Split Mode</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={splitMode === "pages" ? "default" : "outline"}
                        onClick={() => setSplitMode("pages")}
                        className="justify-start"
                      >
                        Individual Pages
                      </Button>
                      <Button
                        variant={splitMode === "ranges" ? "default" : "outline"}
                        onClick={() => setSplitMode("ranges")}
                        className="justify-start"
                      >
                        Page Ranges
                      </Button>
                    </div>
                  </div>

                  {splitMode === "ranges" && (
                    <div className="space-y-2">
                      <Label className="text-foreground">Page Ranges</Label>
                      <Input
                        value={pageRanges}
                        onChange={(e) => setPageRanges(e.target.value)}
                        placeholder="e.g., 1-3, 5, 7-10"
                        className="bg-card/50 border-border text-foreground"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter page ranges separated by commas. Example: 1-3, 5, 7-10
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">Split Preview</h3>
                    {splitMode === "pages" ? (
                      <p className="text-sm text-muted-foreground">
                        Will create {pdfFile.pageCount} separate PDF files, one for each page.
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {pageRanges
                          ? `Will create ${parsePageRanges(pageRanges, pdfFile.pageCount || 0).length} PDF files based on your ranges.`
                          : "Enter page ranges to see preview."}
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={splitPDF}
                    disabled={splitMode === "ranges" && !pageRanges.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
                  >
                    <Split className="w-4 h-4 mr-2" />
                    Split PDF
                  </Button>
                </div>
              )}

              {isSplitting && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-foreground text-lg font-semibold mb-2">Splitting PDF...</h3>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                      <span className="text-foreground">{progress}%</span>
                    </div>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <p className="text-sm text-muted-foreground text-center">Processing {pdfFile?.pageCount} pages...</p>
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
                  <Info className="w-5 h-5 text-purple-400" />
                  How to Split PDFs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {[
                    {
                      step: 1,
                      title: "Upload PDF File",
                      description: "Drag and drop or click to select the PDF file you want to split",
                    },
                    {
                      step: 2,
                      title: "Choose Split Mode",
                      description: "Select individual pages or custom page ranges based on your needs",
                    },
                    {
                      step: 3,
                      title: "Set Parameters",
                      description: "For ranges, specify which pages to extract (e.g., 1-3, 5, 7-10)",
                    },
                    {
                      step: 4,
                      title: "Split & Download",
                      description: "Click split and all resulting PDF files will be downloaded automatically",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
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
                      title: "Flexible Splitting",
                      description: "Split by individual pages or custom page ranges",
                    },
                    {
                      icon: CheckCircle,
                      title: "Batch Download",
                      description: "All split files are downloaded automatically",
                    },
                    {
                      icon: CheckCircle,
                      title: "Quality Preservation",
                      description: "Maintains original PDF quality and formatting",
                    },
                    {
                      icon: CheckCircle,
                      title: "Secure Processing",
                      description: "All splitting happens in your browser for privacy",
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
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">Page Range Format</h4>
                    <p className="text-sm text-muted-foreground">
                      Use commas to separate ranges: "1-3, 5, 7-10" will create 3 files.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">Large Documents</h4>
                    <p className="text-sm text-muted-foreground">
                      For large PDFs, consider splitting by ranges rather than individual pages.
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">File Organization</h4>
                    <p className="text-sm text-muted-foreground">
                      Split files are automatically named with page numbers for easy organization.
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
