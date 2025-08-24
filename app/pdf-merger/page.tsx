"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Merge, Upload, FileText, X, ArrowUp, ArrowDown, Info, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import Script from "next/script"
import ImageToolsSidebar from "@/components/image-tools-sidebar"

interface PDFFile {
  file: File
  id: string
  name: string
  size: string
  pages?: number
}

export default function PDFMerger() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([])
  const [isMerging, setIsMerging] = useState(false)
  const [progress, setProgress] = useState(0)
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
    const newFiles: PDFFile[] = []

    Array.from(files).forEach((file) => {
      if (file.type === "application/pdf") {
        newFiles.push({
          file,
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: formatFileSize(file.size),
        })
      }
    })

    setPdfFiles((prev) => [...prev, ...newFiles])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const removeFile = (id: string) => {
    setPdfFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const moveFile = (id: string, direction: "up" | "down") => {
    setPdfFiles((prev) => {
      const index = prev.findIndex((file) => file.id === id)
      if (index === -1) return prev

      const newFiles = [...prev]
      const targetIndex = direction === "up" ? index - 1 : index + 1

      if (targetIndex >= 0 && targetIndex < newFiles.length) {
        ;[newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]]
      }

      return newFiles
    })
  }

  const mergePDFs = async () => {
    if (pdfFiles.length < 2) return

    setIsMerging(true)
    setProgress(0)

    try {
      // Dynamic import of pdf-lib
      const { PDFDocument } = await import("pdf-lib")

      const mergedPdf = await PDFDocument.create()

      for (let i = 0; i < pdfFiles.length; i++) {
        setProgress((i / pdfFiles.length) * 80)

        const pdfBytes = await pdfFiles[i].file.arrayBuffer()
        const pdf = await PDFDocument.load(pdfBytes)
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())

        copiedPages.forEach((page) => mergedPdf.addPage(page))
      }

      setProgress(90)
      const pdfBytes = await mergedPdf.save()
      setProgress(100)

      // Download the merged PDF
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "merged-document.pdf"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("PDF merge failed:", error)
    } finally {
      setIsMerging(false)
      setProgress(0)
    }
  }

  return (
    <>
      {/* Schema Markup */}
      <Script id="pdf-merger-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "PDF Merger",
          description:
            "Free online PDF merger tool to combine multiple PDF files into one document. Merge PDFs quickly and securely.",
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/pdf-merger`,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: [
            "Merge multiple PDFs",
            "Drag and drop interface",
            "Reorder pages",
            "Secure processing",
            "No file size limits",
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
          <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center gap-2 text-2xl">
                <Merge className="w-6 h-6 text-blue-400" />
                PDF Merger
                <Badge className="bg-blue-400/20 text-blue-600 dark:text-blue-400">Popular</Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Combine multiple PDF files into a single document. Drag to reorder and merge with one click.
              </p>
            </CardHeader>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-400" />
                  Select PDF Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                    isDragOver ? "border-blue-400 bg-blue-400/10" : "border-border hover:border-blue-400/50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-muted-foreground/80 mx-auto mb-4" />
                  <p className="text-foreground text-lg mb-2">Drop PDF files here</p>
                  <p className="text-muted-foreground/80 mb-4">or click to browse</p>
                  <Button variant="outline" className="bg-white/10 border-white/30 text-foreground hover:bg-white/20">
                    Choose PDF Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                  />
                </div>

                {pdfFiles.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground">Selected Files ({pdfFiles.length})</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPdfFiles([])}
                        className="text-red-400 hover:text-red-300"
                      >
                        Clear All
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {pdfFiles.map((pdfFile, index) => (
                        <div
                          key={pdfFile.id}
                          className="flex items-center gap-3 p-3 bg-card/30 rounded-lg border border-border"
                        >
                          <div className="w-8 h-8 bg-red-500/20 rounded flex items-center justify-center">
                            <FileText className="w-4 h-4 text-red-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">{pdfFile.name}</p>
                            <p className="text-xs text-muted-foreground">{pdfFile.size}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveFile(pdfFile.id, "up")}
                              disabled={index === 0}
                              className="w-8 h-8 p-0"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveFile(pdfFile.id, "down")}
                              disabled={index === pdfFiles.length - 1}
                              className="w-8 h-8 p-0"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(pdfFile.id)}
                              className="w-8 h-8 p-0 text-red-400 hover:text-red-300"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Merge Section */}
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Merge Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {pdfFiles.length === 0 && (
                  <div className="text-center py-8">
                    <Merge className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Select PDF files to start merging</p>
                  </div>
                )}

                {pdfFiles.length === 1 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Add at least one more PDF file to merge</p>
                  </div>
                )}

                {pdfFiles.length >= 2 && !isMerging && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <h3 className="font-semibold text-foreground mb-2">Ready to Merge</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {pdfFiles.length} PDF files will be combined into one document in the order shown.
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Total size:{" "}
                        {pdfFiles.reduce((acc, file) => acc + file.file.size, 0) > 0 &&
                          formatFileSize(pdfFiles.reduce((acc, file) => acc + file.file.size, 0))}
                      </div>
                    </div>

                    <Button
                      onClick={mergePDFs}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold"
                    >
                      <Merge className="w-4 h-4 mr-2" />
                      Merge {pdfFiles.length} PDFs
                    </Button>
                  </div>
                )}

                {isMerging && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-foreground text-lg font-semibold mb-2">Merging PDFs...</h3>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="text-foreground">{progress}%</span>
                      </div>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <p className="text-sm text-muted-foreground text-center">Processing {pdfFiles.length} PDF files...</p>
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
                    <Info className="w-5 h-5 text-blue-400" />
                    How to Merge PDFs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    {[
                      {
                        step: 1,
                        title: "Upload PDF Files",
                        description: "Drag and drop or click to select multiple PDF files you want to merge",
                      },
                      {
                        step: 2,
                        title: "Arrange Order",
                        description: "Use the up/down arrows to reorder files in your preferred sequence",
                      },
                      {
                        step: 3,
                        title: "Review Selection",
                        description: "Check the file list and remove any unwanted files using the X button",
                      },
                      {
                        step: 4,
                        title: "Merge & Download",
                        description: "Click merge and your combined PDF will be generated and downloaded",
                      },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
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
                        title: "Unlimited Files",
                        description: "Merge as many PDF files as you need without restrictions",
                      },
                      {
                        icon: CheckCircle,
                        title: "Drag & Drop",
                        description: "Easy file selection with intuitive drag and drop interface",
                      },
                      {
                        icon: CheckCircle,
                        title: "Reorder Pages",
                        description: "Arrange files in any order before merging",
                      },
                      {
                        icon: CheckCircle,
                        title: "Secure Processing",
                        description: "All merging happens in your browser for maximum privacy",
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
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">File Organization</h4>
                      <p className="text-sm text-muted-foreground">
                        Name your files with numbers (01, 02, 03) for easier ordering before upload.
                      </p>
                    </div>
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Large Files</h4>
                      <p className="text-sm text-muted-foreground">
                        For very large PDFs, consider compressing them first to speed up the merge process.
                      </p>
                    </div>
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Quality Preservation</h4>
                      <p className="text-sm text-muted-foreground">
                        The merge process preserves all original formatting, images, and text quality.
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
