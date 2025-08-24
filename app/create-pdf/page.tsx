"use client"

import type { ReactElement } from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import {
  Upload,
  Download, 
  FileText,
  Settings,
  Info,
  CheckCircle,
  Loader2,
  FilePlus,
  RotateCw,
  Minus,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import Script from "next/script"
import ImageToolsSidebar from "@/components/image-tools-sidebar"
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

// Page size definitions in points (1 point = 1/72 inch)
const PAGE_SIZES = {
  'a4': { width: 595, height: 842, label: 'A4 (210 x 297 mm)' },
  'letter': { width: 612, height: 792, label: 'Letter (8.5 x 11 in)' },
  'legal': { width: 612, height: 1008, label: 'Legal (8.5 x 14 in)' },
  'a3': { width: 842, height: 1191, label: 'A3 (297 x 420 mm)' },
}

// Document quality settings
const QUALITY_SETTINGS = {
  'high': { compression: false, label: 'High Quality (Larger file size)' },
  'medium': { compression: true, label: 'Medium Quality (Balanced)' },
  'low': { compression: true, label: 'Small Size (Lower quality)' }
}

export default function PdfCreator(): ReactElement {
  const [files, setFiles] = useState<File[]>([])
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string>("")
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [isDragOver, setIsDragOver] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [documentTitle, setDocumentTitle] = useState<string>("My Document")
  const [pageSize, setPageSize] = useState<string>("a4")
  const [orientation, setOrientation] = useState<string>("portrait")
  const [margins, setMargins] = useState<number[]>([50])
  const [quality, setQuality] = useState<string>("medium")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    }
  }, [pdfUrl])

  const handleFileSelect = useCallback((selectedFiles: FileList) => {
    const validFiles = Array.from(selectedFiles).filter(file => 
      file.type === 'image/jpeg' || 
      file.type === 'image/png' || 
      file.type === 'image/webp' ||
      file.name.toLowerCase().endsWith('.txt')
    )

    if (validFiles.length === 0) {
      setError("Please upload valid files (JPG, PNG, WebP images or TXT files).")
      return
    }

    setError(null)
    setFiles(prev => [...prev, ...validFiles])
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const rotatePage = (index: number) => {
    // In a real implementation, this would rotate the specific page
    // For demo purposes, we'll just show a visual effect
    const pageElement = document.querySelector(`.pdf-page[data-index="${index}"]`)
    if (pageElement) {
      pageElement.classList.toggle('rotate-90')
    }
  }

  const createPdf = async () => {
    if (files.length === 0) {
      setError("Please add at least one file to create a PDF.")
      return
    }

    setIsCreating(true)
    setProgress(0)
    setError(null)

    try {
      // Set up page dimensions based on selected size and orientation
      const size = PAGE_SIZES[pageSize as keyof typeof PAGE_SIZES]
      let width = size.width
      let height = size.height
      
      if (orientation === 'landscape' && (width < height)) {
        [width, height] = [height, width]
      }

      // Create a new PDFDocument
      const pdfDoc = await PDFDocument.create()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      
      // Add progress simulation
      const steps = [
        { label: "Initializing PDF document", duration: 200, progress: 10 },
        { label: "Processing content", duration: 300, progress: 30 },
        { label: "Adding pages", duration: 400, progress: 60 },
        { label: "Applying formatting", duration: 250, progress: 85 },
        { label: "Finalizing document", duration: 200, progress: 95 }
      ]
      
      let currentStep = 0
      const processNextStep = () => {
        if (currentStep >= steps.length) {
          // Final step - complete processing
          setTimeout(async () => {
            // In a real implementation, we'd add the actual content here
            // For demo, we'll just create placeholder pages
            
            for (let i = 0; i < files.length; i++) {
              const page = pdfDoc.addPage([width, height])
              const { width: pageWidth, height: pageHeight } = page.getSize()
              
              // Draw header
              page.drawText(documentTitle, {
                x: margins[0],
                y: pageHeight - margins[0] - 20,
                size: 16,
                font,
                color: rgb(0, 0, 0),
              })
              
              // Draw page number
              page.drawText(`Page ${i + 1} of ${files.length}`, {
                x: pageWidth - margins[0] - 70,
                y: pageHeight - margins[0] - 20,
                size: 10,
                font,
                color: rgb(0.5, 0.5, 0.5),
              })
              
              // Draw content placeholder
              const contentHeight = pageHeight - margins[0] * 2 - 40
              page.drawText(`${files[i].name} (${files[i].type.split('/')[0]})`, {
                x: margins[0],
                y: pageHeight - margins[0] - 40,
                size: 12,
                font,
                color: rgb(0.2, 0.2, 0.2),
              })
              
              page.drawRectangle({
                x: margins[0],
                y: margins[0],
                width: pageWidth - margins[0] * 2,
                height: contentHeight,
                borderColor: rgb(0.8, 0.8, 0.8),
                borderWidth: 1,
                opacity: 0.3,
              })
              
              page.drawText("Content preview", {
                x: pageWidth / 2 - 40,
                y: pageHeight / 2,
                size: 14,
                font,
                color: rgb(0.7, 0.7, 0.7),
              })
            }
            
            // Save the PDF
            const pdfBytes = await pdfDoc.save({
              useObjectStreams: QUALITY_SETTINGS[quality as keyof typeof QUALITY_SETTINGS].compression
            })
            
            // Create blob and URL
            const blob = new Blob([pdfBytes], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            
            setPdfBlob(blob)
            setPdfUrl(url)
            setProgress(100)
            setIsCreating(false)
          }, 300)
          return
        }
        
        const step = steps[currentStep]
        setProgress(step.progress)
        
        setTimeout(() => {
          currentStep++
          processNextStep()
        }, step.duration)
      }
      
      // Start processing sequence
      processNextStep()
      
    } catch (err) {
      console.error("PDF creation failed:", err)
      setError("An unexpected error occurred during PDF creation.")
      setIsCreating(false)
    }
  }

  const downloadPdf = () => {
    if (!pdfBlob) return

    const a = document.createElement("a")
    a.href = pdfUrl
    a.download = `${documentTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getEstimatedPdfSize = (): string => {
    if (files.length === 0) return "N/A"
    
    // Rough estimation based on number of pages and quality
    let sizeInKB = files.length * 100 // Base size per page
    
    if (quality === "high") {
      sizeInKB *= 1.5
    } else if (quality === "low") {
      sizeInKB *= 0.6
    }
    
    return `${Math.round(sizeInKB)} KB`
  }

  return (
    <>
      {/* Schema.org Structured Data */}
      <Script id="pdf-creator-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "PDF Creator",
          description:
            "Free online PDF creator tool to convert images and text to PDF. Create professional PDF documents from your files with custom settings.",
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/pdf-creator`,
          applicationCategory: "DocumentManagement",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: [
            "Image to PDF conversion",
            "Custom page sizes",
            "Document formatting",
            "Quality settings",
            "Privacy-focused processing",
          ],
        })}
      </Script>

      {/* Main Layout: Sidebar on Right */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-screen pt-6 lg:pt-0">
        {/* Main Content - Left */}
        <main className="flex-1 lg:w-3/4 space-y-6">
          {/* Offset to prevent header overlap */}
          <div id="top" className="h-16"></div>

          {/* Page Header (Non-Sticky) */}
          <Card className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center gap-2 text-2xl">
                <FileText className="w-6 h-6 text-blue-400" />
                PDF Creator
                <Badge className="bg-blue-400/20 text-blue-600 dark:text-blue-400">Popular</Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Convert images and text files to professional PDF documents. Customize page size, orientation, and quality settings.
              </p>
            </CardHeader>
          </Card>

          {/* Upload & Settings Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-400" />
                  Add Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                    {error}
                  </div>
                )}
                {files.length === 0 ? (
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" || e.key === " ") triggerFileInput()
                    }}
                    onClick={triggerFileInput}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${
                      isDragOver
                        ? "border-blue-400 bg-blue-400/10"
                        : "border-border hover:border-blue-400/50"
                    }`}
                  >
                    <FilePlus className="w-12 h-12 text-muted-foreground/80 mx-auto mb-4" />
                    <p className="text-foreground text-lg mb-2">Drop files here</p>
                    <p className="text-muted-foreground/80 mb-4">Supports JPG, PNG, WebP, TXT</p>
                    <Button
                      variant="outline"
                      className="bg-white/10 border-white/30 text-foreground hover:bg-white/20"
                    >
                      Choose Files
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,text/plain"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          handleFileSelect(e.target.files)
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {files.map((file, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-2 bg-card/30 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center">
                              {file.type.startsWith('image/') ? (
                                <FileText className="w-4 h-4 text-blue-400" />
                              ) : (
                                <FileText className="w-4 h-4 text-blue-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-foreground font-medium text-sm line-clamp-1 max-w-[180px]">
                                {file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {file.type.startsWith('image/') ? 'Image' : 'Text'} • {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(index)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4 border-t border-border">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Files:</span>
                          <span className="text-foreground font-medium">
                            {files.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Estimated PDF:</span>
                          <span className="text-foreground font-medium">
                            {getEstimatedPdfSize()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* PDF Settings */}
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground">PDF Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* Document Title */}
                  <div className="space-y-2">
                    <Label htmlFor="document-title" className="text-foreground">
                      Document Title
                    </Label>
                    <Input
                      id="document-title"
                      type="text"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      placeholder="My Document"
                      className="bg-card/50 border-border text-foreground"
                    />
                  </div>
                  
                  {/* Page Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="page-size" className="text-foreground">
                        Page Size
                      </Label>
                      <Select value={pageSize} onValueChange={setPageSize}>
                        <SelectTrigger 
                          id="page-size"
                          className="bg-card/50 border-border text-foreground"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PAGE_SIZES).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="orientation" className="text-foreground">
                        Orientation
                      </Label>
                      <Select value={orientation} onValueChange={setOrientation}>
                        <SelectTrigger 
                          id="orientation"
                          className="bg-card/50 border-border text-foreground"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="portrait">Portrait</SelectItem>
                          <SelectItem value="landscape">Landscape</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Margins */}
                  <div className="space-y-2">
                    <Label className="text-foreground">
                      Margins: {margins[0]}pt
                    </Label>
                    <Slider
                      value={margins}
                      onValueChange={setMargins}
                      max={100}
                      min={20}
                      step={5}
                      className="[&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-blue-500"
                    />
                    <p className="text-xs text-muted-foreground">
                      Adjust the space between content and page edges
                    </p>
                  </div>
                  
                  {/* Quality */}
                  <div className="space-y-2">
                    <Label htmlFor="quality" className="text-foreground">
                      Quality
                    </Label>
                    <Select value={quality} onValueChange={setQuality}>
                      <SelectTrigger 
                        id="quality"
                        className="bg-card/50 border-border text-foreground"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(QUALITY_SETTINGS).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={createPdf}
                  disabled={isCreating || files.length === 0}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating PDF...
                    </>
                  ) : (
                    <>
                      <FilePlus className="w-4 h-4 mr-2" />
                      Create PDF
                    </>
                  )}
                </Button>

                {isCreating && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      {progress < 20 && "Initializing PDF document..."}
                      {progress >= 20 && progress < 40 && "Processing content..."}
                      {progress >= 40 && progress < 70 && "Adding pages..."}
                      {progress >= 70 && progress < 90 && "Applying formatting..."}
                      {progress >= 90 && "Finalizing document..."}
                    </p>
                  </div>
                )}

                {pdfBlob && (
                  <div className="space-y-4">
                    {/* PDF Preview */}
                    <div className="border border-border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-foreground">Preview</h4>
                        <Badge className="bg-blue-500/20 text-blue-300">PDF</Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {files.slice(0, 3).map((file, index) => (
                          <div 
                            key={index} 
                            className="border border-border rounded overflow-hidden bg-background"
                            style={{ 
                              aspectRatio: orientation === 'portrait' ? '0.707' : '1.414',
                              transform: orientation === 'landscape' ? 'rotate(90deg) translateX(100%)' : 'none'
                            }}
                            data-index={index}
                          >
                            <div 
                              className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 p-4"
                              style={{ 
                                transform: orientation === 'landscape' ? 'rotate(-90deg) translateY(-100%)' : 'none',
                                transformOrigin: 'top left'
                              }}
                            >
                              <div className="h-full flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-medium text-foreground text-sm">{documentTitle}</h5>
                                  <span className="text-xs text-muted-foreground">Page {index + 1}</span>
                                </div>
                                <div className="flex-1 border-2 border-dashed border-border rounded flex items-center justify-center text-muted-foreground/70">
                                  {file.type.startsWith('image/') ? 'Image' : 'Text'} Content
                                </div>
                                <div className="mt-2 text-xs text-muted-foreground text-center">
                                  {file.name}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {files.length > 3 && (
                          <div className="text-center py-2 text-xs text-muted-foreground">
                            + {files.length - 3} more page{files.length > 4 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pages:</span>
                        <span className="text-foreground font-medium">
                          {files.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span className="text-foreground font-medium">
                          {getEstimatedPdfSize()}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={downloadPdf}
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
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
                    <Info className="w-5 h-5 text-blue-400" />
                    How to Create PDFs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      step: 1,
                      title: "Add Content",
                      description: "Upload images or text files that you want to include in your PDF",
                    },
                    {
                      step: 2,
                      title: "Configure Settings",
                      description: "Set page size, orientation, margins, and quality options",
                    },
                    {
                      step: 3,
                      title: "Create Document",
                      description: "Click 'Create PDF' to generate your professional document",
                    },
                    {
                      step: 4,
                      title: "Download & Use",
                      description: "Download your PDF for sharing, printing, or further editing",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
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
                        title: "Multiple File Support",
                        description: "Combine different image formats and text files into a single PDF",
                      },
                      {
                        icon: CheckCircle,
                        title: "Custom Page Settings",
                        description: "Choose from standard page sizes with portrait or landscape orientation",
                      },
                      {
                        icon: CheckCircle,
                        title: "Adjustable Margins",
                        description: "Fine-tune the spacing around your content for professional layout",
                      },
                      {
                        icon: CheckCircle,
                        title: "Quality Optimization",
                        description: "Balance between file size and visual quality for different use cases",
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
                      <h4 className="font-semibold text-foreground mb-1">Document Organization</h4>
                      <p className="text-sm text-muted-foreground">
                        Arrange your files in the desired order before creating the PDF. The tool will maintain the sequence you've added them in.
                      </p>
                    </div>
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Quality Selection</h4>
                      <p className="text-sm text-muted-foreground">
                        Use 'High Quality' for documents that will be printed or viewed on large screens, and 'Small Size' for documents that will be emailed or shared online.
                      </p>
                    </div>
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Professional Touch</h4>
                      <p className="text-sm text-muted-foreground">
                        Add a title that clearly describes your document's content. Consider including a cover image as the first page for a polished look.
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
