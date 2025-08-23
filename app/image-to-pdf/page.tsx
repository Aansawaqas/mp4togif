"use client"

import type React from "react"
import { useState, useRef } from "react"
import { FileText, Upload, ImageIcon, X, Info, CheckCircle, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import Script from "next/script"

interface ImageFile {
  file: File
  id: string
  name: string
  size: string
  url: string
}

export default function ImageToPDF() {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([])
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [pageSize, setPageSize] = useState("a4")
  const [orientation, setOrientation] = useState("portrait")
  const [layout, setLayout] = useState("fit")
  const [title, setTitle] = useState("")
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
    const newFiles: ImageFile[] = []

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        newFiles.push({
          file,
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: formatFileSize(file.size),
          url: URL.createObjectURL(file),
        })
      }
    })

    setImageFiles((prev) => [...prev, ...newFiles])
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

  const removeImage = (id: string) => {
    setImageFiles((prev) => {
      const updated = prev.filter((file) => file.id !== id)
      // Clean up object URLs
      const removed = prev.find((file) => file.id === id)
      if (removed) {
        URL.revokeObjectURL(removed.url)
      }
      return updated
    })
  }

  const moveImage = (id: string, direction: "up" | "down") => {
    setImageFiles((prev) => {
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

  const getPageDimensions = (size: string, orientation: string) => {
    const sizes = {
      a4: orientation === "portrait" ? [595, 842] : [842, 595],
      letter: orientation === "portrait" ? [612, 792] : [792, 612],
      legal: orientation === "portrait" ? [612, 1008] : [1008, 612],
      a3: orientation === "portrait" ? [842, 1191] : [1191, 842],
    }
    return sizes[size as keyof typeof sizes] || sizes.a4
  }

  const convertToPDF = async () => {
    if (imageFiles.length === 0) return

    setIsConverting(true)
    setProgress(0)

    try {
      const { PDFDocument } = await import("pdf-lib")
      const pdfDoc = await PDFDocument.create()

      const [pageWidth, pageHeight] = getPageDimensions(pageSize, orientation)

      for (let i = 0; i < imageFiles.length; i++) {
        setProgress((i / imageFiles.length) * 90)

        const imageFile = imageFiles[i]
        const imageBytes = await imageFile.file.arrayBuffer()

        let image
        try {
          if (imageFile.file.type === "image/png") {
            image = await pdfDoc.embedPng(imageBytes)
          } else if (imageFile.file.type === "image/jpeg" || imageFile.file.type === "image/jpg") {
            image = await pdfDoc.embedJpg(imageBytes)
          } else {
            // Convert other formats to PNG first
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")!
            const img = new Image()

            await new Promise((resolve, reject) => {
              img.onload = resolve
              img.onerror = reject
              img.src = imageFile.url
            })

            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)

            const pngDataUrl = canvas.toDataURL("image/png")
            const pngBytes = await fetch(pngDataUrl).then((res) => res.arrayBuffer())
            image = await pdfDoc.embedPng(pngBytes)
          }

          const page = pdfDoc.addPage([pageWidth, pageHeight])
          const { width: imgWidth, height: imgHeight } = image.scale(1)

          let drawWidth, drawHeight, x, y

          if (layout === "fit") {
            // Fit image to page while maintaining aspect ratio
            const scaleX = pageWidth / imgWidth
            const scaleY = pageHeight / imgHeight
            const scale = Math.min(scaleX, scaleY)

            drawWidth = imgWidth * scale
            drawHeight = imgHeight * scale
            x = (pageWidth - drawWidth) / 2
            y = (pageHeight - drawHeight) / 2
          } else if (layout === "fill") {
            // Fill entire page
            drawWidth = pageWidth
            drawHeight = pageHeight
            x = 0
            y = 0
          } else {
            // Center image at original size (may be cropped)
            drawWidth = imgWidth
            drawHeight = imgHeight
            x = (pageWidth - drawWidth) / 2
            y = (pageHeight - drawHeight) / 2
          }

          page.drawImage(image, {
            x,
            y,
            width: drawWidth,
            height: drawHeight,
          })
        } catch (imageError) {
          console.error(`Error processing image ${imageFile.name}:`, imageError)
        }
      }

      setProgress(95)

      // Set document metadata
      if (title.trim()) {
        pdfDoc.setTitle(title)
      }
      pdfDoc.setCreator("Image to PDF Converter")
      pdfDoc.setProducer("Free Online Tools")

      const pdfBytes = await pdfDoc.save()
      setProgress(100)

      // Download the PDF
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title || "images"}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setTimeout(() => {
        setProgress(0)
        alert("PDF created successfully! Check your downloads folder.")
      }, 1000)
    } catch (error) {
      console.error("Image to PDF conversion failed:", error)
      alert("Image to PDF conversion failed. Please try again.")
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <>
      {/* Schema Markup */}
      <Script id="image-to-pdf-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Image to PDF Converter",
          description:
            "Free online image to PDF converter tool. Convert JPEG, PNG, WebP images to PDF documents with custom layouts.",
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/image-to-pdf`,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: [
            "Multiple image formats",
            "Custom page layouts",
            "Batch conversion",
            "Quality preservation",
            "Page size options",
          ],
        })}
      </Script>

      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 text-cyan-400" />
              Image to PDF Converter
              <Badge className="bg-cyan-400/20 text-cyan-600 dark:text-cyan-400">Popular</Badge>
            </CardTitle>
            <p className="text-muted-foreground">
              Convert images to PDF documents with custom layouts, page sizes, and quality settings.
            </p>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="bg-card/50 backdrop-blur-lg border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-400" />
                Select Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                  isDragOver ? "border-cyan-400 bg-cyan-400/10" : "border-border hover:border-cyan-400/50"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-12 h-12 text-muted-foreground/80 mx-auto mb-4" />
                <p className="text-foreground text-lg mb-2">Drop images here</p>
                <p className="text-muted-foreground/80 mb-4">or click to browse</p>
                <Button variant="outline" className="bg-white/10 border-white/30 text-foreground hover:bg-white/20">
                  Choose Images
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                />
              </div>

              {imageFiles.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Selected Images ({imageFiles.length})</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        imageFiles.forEach((file) => URL.revokeObjectURL(file.url))
                        setImageFiles([])
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      Clear All
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {imageFiles.map((imageFile, index) => (
                      <div
                        key={imageFile.id}
                        className="flex items-center gap-3 p-3 bg-card/30 rounded-lg border border-border"
                      >
                        <img
                          src={imageFile.url || "/placeholder.svg"}
                          alt={imageFile.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{imageFile.name}</p>
                          <p className="text-xs text-muted-foreground">{imageFile.size}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveImage(imageFile.id, "up")}
                            disabled={index === 0}
                            className="w-8 h-8 p-0"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveImage(imageFile.id, "down")}
                            disabled={index === imageFiles.length - 1}
                            className="w-8 h-8 p-0"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(imageFile.id)}
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

          {/* Conversion Settings */}
          <Card className="bg-card/50 backdrop-blur-lg border-border">
            <CardHeader>
              <CardTitle className="text-foreground">PDF Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {imageFiles.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Select images to start conversion</p>
                </div>
              )}

              {imageFiles.length > 0 && !isConverting && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Document Title (Optional)</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter PDF title..."
                      className="bg-card/50 border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Page Size</Label>
                    <Select value={pageSize} onValueChange={setPageSize}>
                      <SelectTrigger className="bg-card/50 border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                        <SelectItem value="letter">Letter (8.5 × 11 in)</SelectItem>
                        <SelectItem value="legal">Legal (8.5 × 14 in)</SelectItem>
                        <SelectItem value="a3">A3 (297 × 420 mm)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Orientation</Label>
                    <Select value={orientation} onValueChange={setOrientation}>
                      <SelectTrigger className="bg-card/50 border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Image Layout</Label>
                    <Select value={layout} onValueChange={setLayout}>
                      <SelectTrigger className="bg-card/50 border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fit">Fit to Page</SelectItem>
                        <SelectItem value="fill">Fill Page</SelectItem>
                        <SelectItem value="center">Center Original Size</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">Conversion Preview</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {imageFiles.length} images will be converted to a single PDF
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Page size: {pageSize.toUpperCase()} ({orientation})
                    </p>
                  </div>

                  <Button
                    onClick={convertToPDF}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Convert to PDF
                  </Button>
                </div>
              )}

              {isConverting && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-foreground text-lg font-semibold mb-2">Creating PDF...</h3>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
                      <span className="text-foreground">{progress}%</span>
                    </div>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <p className="text-sm text-muted-foreground text-center">Processing {imageFiles.length} images...</p>
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
                  <Info className="w-5 h-5 text-cyan-400" />
                  How to Convert Images to PDF
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {[
                    {
                      step: 1,
                      title: "Upload Images",
                      description: "Drag and drop or click to select multiple images you want to convert",
                    },
                    {
                      step: 2,
                      title: "Arrange Order",
                      description: "Use the up/down arrows to reorder images in your preferred sequence",
                    },
                    {
                      step: 3,
                      title: "Configure Settings",
                      description: "Choose page size, orientation, and how images should be laid out",
                    },
                    {
                      step: 4,
                      title: "Convert & Download",
                      description: "Click convert and your PDF will be created and downloaded automatically",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
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
                      description: "Support for JPEG, PNG, WebP, and other image formats",
                    },
                    {
                      icon: CheckCircle,
                      title: "Custom Layouts",
                      description: "Choose how images fit on pages with smart scaling",
                    },
                    {
                      icon: CheckCircle,
                      title: "Page Options",
                      description: "Multiple page sizes and orientations available",
                    },
                    {
                      icon: CheckCircle,
                      title: "Quality Preservation",
                      description: "Maintains original image quality in PDF output",
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
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">Image Order</h4>
                    <p className="text-sm text-muted-foreground">
                      Arrange images in the order you want them to appear in the PDF before converting.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">Layout Choice</h4>
                    <p className="text-sm text-muted-foreground">
                      Use "Fit to Page" for documents, "Fill Page" for photos, "Center" for original sizing.
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">File Size</h4>
                    <p className="text-sm text-muted-foreground">
                      Large images will create larger PDFs. Consider resizing images first if file size matters.
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
