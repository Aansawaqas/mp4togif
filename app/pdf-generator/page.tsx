"use client"

import type React from "react"

import { useState, useRef } from "react"
import { FilePlus, Download, Type, ImageIcon, Code, Info, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Script from "next/script"

export default function PDFGenerator() {
  const [textContent, setTextContent] = useState("")
  const [title, setTitle] = useState("")
  const [fontSize, setFontSize] = useState("12")
  const [pageSize, setPageSize] = useState("a4")
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [htmlContent, setHtmlContent] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generatePDFFromText = async () => {
    if (!textContent.trim()) return

    setIsGenerating(true)
    try {
      // Dynamic import of jsPDF
      const { jsPDF } = await import("jspdf")

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: pageSize,
      })

      // Add title if provided
      if (title.trim()) {
        doc.setFontSize(18)
        doc.setFont(undefined, "bold")
        doc.text(title, 20, 30)
        doc.setFontSize(Number.parseInt(fontSize))
        doc.setFont(undefined, "normal")
      }

      // Split text into lines and add to PDF
      const lines = doc.splitTextToSize(textContent, 170)
      const startY = title.trim() ? 50 : 30
      doc.text(lines, 20, startY)

      // Download the PDF
      doc.save(`${title || "document"}.pdf`)
    } catch (error) {
      console.error("PDF generation failed:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generatePDFFromImages = async () => {
    if (selectedImages.length === 0) return

    setIsGenerating(true)
    try {
      const { jsPDF } = await import("jspdf")

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: pageSize,
      })

      for (let i = 0; i < selectedImages.length; i++) {
        if (i > 0) doc.addPage()

        const img = selectedImages[i]
        const imgUrl = URL.createObjectURL(img)

        // Add image to PDF
        const imgElement = new Image()
        imgElement.onload = () => {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")
          canvas.width = imgElement.width
          canvas.height = imgElement.height
          ctx?.drawImage(imgElement, 0, 0)

          const imgData = canvas.toDataURL("image/jpeg", 0.8)
          doc.addImage(imgData, "JPEG", 10, 10, 190, 0)

          if (i === selectedImages.length - 1) {
            doc.save("images.pdf")
            setIsGenerating(false)
          }
        }
        imgElement.src = imgUrl
      }
    } catch (error) {
      console.error("PDF generation failed:", error)
      setIsGenerating(false)
    }
  }

  const generatePDFFromHTML = async () => {
    if (!htmlContent.trim()) return

    setIsGenerating(true)
    try {
      const { jsPDF } = await import("jspdf")

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: pageSize,
      })

      // Create a temporary div to render HTML
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = htmlContent
      tempDiv.style.width = "210mm"
      tempDiv.style.padding = "20mm"
      document.body.appendChild(tempDiv)

      // Convert HTML to PDF (simplified version)
      const canvas = await import("html2canvas")
      const canvasElement = await canvas.default(tempDiv)
      const imgData = canvasElement.toDataURL("image/png")

      doc.addImage(imgData, "PNG", 0, 0, 210, 297)
      doc.save("html-document.pdf")

      document.body.removeChild(tempDiv)
    } catch (error) {
      console.error("PDF generation failed:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedImages(files)
  }

  return (
    <>
      {/* Schema Markup */}
      <Script id="pdf-generator-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "PDF Generator",
          description:
            "Free online PDF generator tool to create PDFs from text, images, and HTML. Generate professional documents instantly.",
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/pdf-generator`,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: [
            "Text to PDF conversion",
            "Image to PDF conversion",
            "HTML to PDF conversion",
            "Custom page sizes",
            "Font customization",
          ],
        })}
      </Script>

      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <FilePlus className="w-6 h-6 text-green-400" />
              PDF Generator
              <Badge className="bg-green-400/20 text-green-600 dark:text-green-400">Most Popular</Badge>
            </CardTitle>
            <p className="text-muted-foreground">
              Create professional PDF documents from text, images, or HTML content with custom formatting options.
            </p>
          </CardHeader>
        </Card>

        {/* Generator Tabs */}
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Text to PDF
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Images to PDF
            </TabsTrigger>
            <TabsTrigger value="html" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              HTML to PDF
            </TabsTrigger>
          </TabsList>

          {/* Text to PDF */}
          <TabsContent value="text" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-card/50 backdrop-blur-lg border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Document Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Document Title (Optional)</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter document title..."
                      className="bg-card/50 border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Text Content</Label>
                    <Textarea
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Enter your text content here..."
                      rows={10}
                      className="bg-card/50 border-border text-foreground resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-lg border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">PDF Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    <Label className="text-foreground">Font Size</Label>
                    <Select value={fontSize} onValueChange={setFontSize}>
                      <SelectTrigger className="bg-card/50 border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10pt</SelectItem>
                        <SelectItem value="12">12pt</SelectItem>
                        <SelectItem value="14">14pt</SelectItem>
                        <SelectItem value="16">16pt</SelectItem>
                        <SelectItem value="18">18pt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={generatePDFFromText}
                      disabled={!textContent.trim() || isGenerating}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Generate PDF
                        </>
                      )}
                    </Button>
                  </div>

                  {textContent.trim() && (
                    <div className="text-sm text-muted-foreground">
                      <p>Characters: {textContent.length}</p>
                      <p>Estimated pages: {Math.ceil(textContent.length / 2000)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Images to PDF */}
          <TabsContent value="images" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Select Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-green-400/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 text-muted-foreground/80 mx-auto mb-4" />
                  <p className="text-foreground text-lg mb-2">Select Images</p>
                  <p className="text-muted-foreground/80 mb-4">Choose multiple images to create a PDF</p>
                  <Button variant="outline" className="bg-white/10 border-white/30 text-foreground hover:bg-white/20">
                    Choose Images
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </div>

                {selectedImages.length > 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image) || "/placeholder.svg"}
                            alt={`Selected ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Badge className="absolute top-1 right-1 bg-green-500/20 text-green-300 text-xs">
                            {index + 1}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={generatePDFFromImages}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Generate PDF from {selectedImages.length} Images
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* HTML to PDF */}
          <TabsContent value="html" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground">HTML Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">HTML Code</Label>
                  <Textarea
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    placeholder="<h1>Your HTML content here...</h1>"
                    rows={12}
                    className="bg-card/50 border-border text-foreground font-mono text-sm resize-none"
                  />
                </div>

                <Button
                  onClick={generatePDFFromHTML}
                  disabled={!htmlContent.trim() || isGenerating}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate PDF from HTML
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
                  <Info className="w-5 h-5 text-green-400" />
                  How to Generate PDFs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {[
                    {
                      step: 1,
                      title: "Choose Input Type",
                      description: "Select whether you want to create PDF from text, images, or HTML content",
                    },
                    {
                      step: 2,
                      title: "Add Your Content",
                      description: "Enter text, upload images, or paste HTML code depending on your choice",
                    },
                    {
                      step: 3,
                      title: "Customize Settings",
                      description: "Adjust page size, font size, and other formatting options",
                    },
                    {
                      step: 4,
                      title: "Generate & Download",
                      description: "Click generate and your PDF will be created and downloaded automatically",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
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
                      title: "Multiple Input Types",
                      description: "Create PDFs from text, images, or HTML content",
                    },
                    {
                      icon: CheckCircle,
                      title: "Custom Formatting",
                      description: "Choose page sizes, fonts, and layout options",
                    },
                    {
                      icon: CheckCircle,
                      title: "Batch Processing",
                      description: "Convert multiple images to a single PDF document",
                    },
                    {
                      icon: CheckCircle,
                      title: "Client-Side Generation",
                      description: "All processing happens in your browser for privacy",
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
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">Text Formatting</h4>
                    <p className="text-sm text-muted-foreground">
                      Use line breaks and spacing in your text for better readability in the final PDF.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">Image Quality</h4>
                    <p className="text-sm text-muted-foreground">
                      Use high-resolution images for better quality in the PDF output.
                    </p>
                  </div>
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">HTML Content</h4>
                    <p className="text-sm text-muted-foreground">
                      Keep HTML simple and avoid complex CSS for best conversion results.
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
