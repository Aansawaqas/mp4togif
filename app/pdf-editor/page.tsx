"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Edit, Upload, FileText, X, Type, Highlighter, Save, Info, CheckCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import Script from "next/script"

interface PDFFile {
  file: File
  name: string
  size: string
}

interface TextAnnotation {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  page: number
}

export default function PDFEditor() {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [editMode, setEditMode] = useState<"text" | "highlight" | "signature">("text")
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([])
  const [newText, setNewText] = useState("")
  const [fontSize, setFontSize] = useState("12")
  const [textColor, setTextColor] = useState("#000000")
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
      })
      setTextAnnotations([])
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

  const addTextAnnotation = () => {
    if (!newText.trim()) return

    const annotation: TextAnnotation = {
      id: Math.random().toString(36).substr(2, 9),
      text: newText,
      x: 100, // Default position
      y: 100,
      fontSize: Number.parseInt(fontSize),
      color: textColor,
      page: 1, // Default to first page
    }

    setTextAnnotations((prev) => [...prev, annotation])
    setNewText("")
  }

  const removeAnnotation = (id: string) => {
    setTextAnnotations((prev) => prev.filter((ann) => ann.id !== id))
  }

  const updateAnnotation = (id: string, updates: Partial<TextAnnotation>) => {
    setTextAnnotations((prev) => prev.map((ann) => (ann.id === id ? { ...ann, ...updates } : ann)))
  }

  const saveEditedPDF = async () => {
    if (!pdfFile) return

    setIsProcessing(true)
    setProgress(0)

    try {
      const { PDFDocument, rgb } = await import("pdf-lib")
      const arrayBuffer = await pdfFile.file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      setProgress(30)

      // Add text annotations
      for (const annotation of textAnnotations) {
        const pages = pdfDoc.getPages()
        const page = pages[annotation.page - 1] || pages[0]

        // Convert hex color to RGB
        const hexColor = annotation.color.replace("#", "")
        const r = Number.parseInt(hexColor.substr(0, 2), 16) / 255
        const g = Number.parseInt(hexColor.substr(2, 2), 16) / 255
        const b = Number.parseInt(hexColor.substr(4, 2), 16) / 255

        page.drawText(annotation.text, {
          x: annotation.x,
          y: page.getHeight() - annotation.y, // PDF coordinates are bottom-up
          size: annotation.fontSize,
          color: rgb(r, g, b),
        })
      }

      setProgress(80)

      // Save the modified PDF
      const pdfBytes = await pdfDoc.save()
      setProgress(100)

      // Download the edited PDF
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${pdfFile.name.replace(".pdf", "")}_edited.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setTimeout(() => {
        setProgress(0)
        alert("PDF edited successfully! Check your downloads folder.")
      }, 1000)
    } catch (error) {
      console.error("PDF editing failed:", error)
      alert("PDF editing failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      {/* Schema Markup */}
      <Script id="pdf-editor-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "PDF Editor",
          description:
            "Free online PDF editor tool to edit text, add annotations, and modify PDF documents. Professional PDF editing in your browser.",
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/pdf-editor`,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: [
            "Text editing",
            "Annotations and comments",
            "Form filling",
            "Digital signatures",
            "Page management",
          ],
        })}
      </Script>

      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Edit className="w-6 h-6 text-red-400" />
              PDF Editor
              <Badge className="bg-red-400/20 text-red-600 dark:text-red-400">Professional</Badge>
            </CardTitle>
            <p className="text-muted-foreground">
              Edit PDF documents with text editing, annotations, form filling, and digital signature capabilities.
            </p>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="bg-card/50 backdrop-blur-lg border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Upload className="w-5 h-5 text-red-400" />
                Select PDF File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                  isDragOver ? "border-red-400 bg-red-400/10" : "border-border hover:border-red-400/50"
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
                        setTextAnnotations([])
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

          {/* Editing Tools */}
          <Card className="bg-card/50 backdrop-blur-lg border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Editing Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!pdfFile && (
                <div className="text-center py-8">
                  <Edit className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a PDF file to start editing</p>
                </div>
              )}

              {pdfFile && !isProcessing && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Edit Mode</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={editMode === "text" ? "default" : "outline"}
                        onClick={() => setEditMode("text")}
                        size="sm"
                      >
                        <Type className="w-4 h-4 mr-1" />
                        Text
                      </Button>
                      <Button
                        variant={editMode === "highlight" ? "default" : "outline"}
                        onClick={() => setEditMode("highlight")}
                        size="sm"
                      >
                        <Highlighter className="w-4 h-4 mr-1" />
                        Highlight
                      </Button>
                      <Button
                        variant={editMode === "signature" ? "default" : "outline"}
                        onClick={() => setEditMode("signature")}
                        size="sm"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Sign
                      </Button>
                    </div>
                  </div>

                  {editMode === "text" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-foreground">Add Text</Label>
                        <Textarea
                          value={newText}
                          onChange={(e) => setNewText(e.target.value)}
                          placeholder="Enter text to add to PDF..."
                          rows={3}
                          className="bg-card/50 border-border text-foreground resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-foreground">Font Size</Label>
                          <Select value={fontSize} onValueChange={setFontSize}>
                            <SelectTrigger className="bg-card/50 border-border text-foreground">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="8">8pt</SelectItem>
                              <SelectItem value="10">10pt</SelectItem>
                              <SelectItem value="12">12pt</SelectItem>
                              <SelectItem value="14">14pt</SelectItem>
                              <SelectItem value="16">16pt</SelectItem>
                              <SelectItem value="18">18pt</SelectItem>
                              <SelectItem value="24">24pt</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground">Text Color</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="w-8 h-8 rounded border border-border"
                            />
                            <Input
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="bg-card/50 border-border text-foreground text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={addTextAnnotation}
                        disabled={!newText.trim()}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Text Annotation
                      </Button>
                    </div>
                  )}

                  {textAnnotations.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-foreground">Text Annotations ({textAnnotations.length})</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {textAnnotations.map((annotation) => (
                          <div
                            key={annotation.id}
                            className="flex items-center gap-2 p-2 bg-card/30 rounded border border-border"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground truncate">{annotation.text}</p>
                              <p className="text-xs text-muted-foreground">
                                Page {annotation.page} • {annotation.fontSize}pt • {annotation.color}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAnnotation(annotation.id)}
                              className="w-6 h-6 p-0 text-red-400 hover:text-red-300"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border">
                    <Button
                      onClick={saveEditedPDF}
                      disabled={textAnnotations.length === 0}
                      className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Edited PDF
                    </Button>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-foreground text-lg font-semibold mb-2">Processing PDF...</h3>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                      <span className="text-foreground">{progress}%</span>
                    </div>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <p className="text-sm text-muted-foreground text-center">
                    Applying {textAnnotations.length} annotations...
                  </p>
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
                  <Info className="w-5 h-5 text-red-400" />
                  How to Edit PDFs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {[
                    {
                      step: 1,
                      title: "Upload PDF File",
                      description: "Drag and drop or click to select the PDF file you want to edit",
                    },
                    {
                      step: 2,
                      title: "Choose Edit Mode",
                      description: "Select text editing, highlighting, or signature mode based on your needs",
                    },
                    {
                      step: 3,
                      title: "Add Annotations",
                      description: "Add text, highlights, or signatures with custom positioning and styling",
                    },
                    {
                      step: 4,
                      title: "Save & Download",
                      description: "Save your changes and download the edited PDF document",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
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
                      title: "Text Annotations",
                      description: "Add custom text with font size and color control",
                    },
                    {
                      icon: CheckCircle,
                      title: "Multiple Edit Modes",
                      description: "Text editing, highlighting, and signature tools",
                    },
                    {
                      icon: CheckCircle,
                      title: "Custom Positioning",
                      description: "Place annotations exactly where you need them",
                    },
                    {
                      icon: CheckCircle,
                      title: "Secure Processing",
                      description: "All editing happens in your browser for privacy",
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
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">Text Placement</h4>
                    <p className="text-sm text-muted-foreground">
                      Plan your text placement carefully - annotations are positioned from the top-left corner.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">Font Selection</h4>
                    <p className="text-sm text-muted-foreground">
                      Use appropriate font sizes - 12pt for body text, 14-16pt for headings.
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">Color Contrast</h4>
                    <p className="text-sm text-muted-foreground">
                      Choose colors that contrast well with the document background for readability.
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
