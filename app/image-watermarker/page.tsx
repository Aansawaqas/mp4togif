"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Droplets, Upload, Download, Info, CheckCircle, Type, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import Script from "next/script"
import ImageToolsSidebar from "@/components/image-tools-sidebar" // Assuming this component exists

const positions = [
  { label: "Top Left", value: "top-left" },
  { label: "Top Center", value: "top-center" },
  { label: "Top Right", value: "top-right" },
  { label: "Middle Left", value: "middle-left" },
  { label: "Center", value: "center" },
  { label: "Middle Right", value: "middle-right" },
  { label: "Bottom Left", value: "bottom-left" },
  { label: "Bottom Center", value: "bottom-center" },
  { label: "Bottom Right", value: "bottom-right" },
]

export default function ImageWatermarker() {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null)
  const [watermarkedFile, setWatermarkedFile] = useState<File | null>(null)
  const [originalPreview, setOriginalPreview] = useState<string>("")
  const [watermarkPreview, setWatermarkPreview] = useState<string>("")
  const [watermarkedPreview, setWatermarkedPreview] = useState<string>("")
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text")
  const [watermarkText, setWatermarkText] = useState("© Your Name")
  const [position, setPosition] = useState("bottom-right")
  const [opacity, setOpacity] = useState([50])
  const [fontSize, setFontSize] = useState([24])
  const [textColor, setTextColor] = useState("#ffffff")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const watermarkInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      setOriginalFile(file)
      const url = URL.createObjectURL(file)
      setOriginalPreview(url)
      setWatermarkedFile(null)
      setWatermarkedPreview("")
      setProgress(0)
    }
  }, [])

  const handleWatermarkSelect = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      setWatermarkFile(file)
      const url = URL.createObjectURL(file)
      setWatermarkPreview(url)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const droppedFile = e.dataTransfer.files[0]
      handleFileSelect(droppedFile)
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const getWatermarkPosition = (
    imgWidth: number,
    imgHeight: number,
    watermarkWidth: number,
    watermarkHeight: number,
  ) => {
    const padding = 20

    switch (position) {
      case "top-left":
        return { x: padding, y: padding }
      case "top-center":
        return { x: (imgWidth - watermarkWidth) / 2, y: padding }
      case "top-right":
        return { x: imgWidth - watermarkWidth - padding, y: padding }
      case "middle-left":
        return { x: padding, y: (imgHeight - watermarkHeight) / 2 }
      case "center":
        return { x: (imgWidth - watermarkWidth) / 2, y: (imgHeight - watermarkHeight) / 2 }
      case "middle-right":
        return { x: imgWidth - watermarkWidth - padding, y: (imgHeight - watermarkHeight) / 2 }
      case "bottom-left":
        return { x: padding, y: imgHeight - watermarkHeight - padding }
      case "bottom-center":
        return { x: (imgWidth - watermarkWidth) / 2, y: imgHeight - watermarkHeight - padding }
      case "bottom-right":
        return { x: imgWidth - watermarkWidth - padding, y: imgHeight - watermarkHeight - padding }
      default:
        return { x: imgWidth - watermarkWidth - padding, y: imgHeight - watermarkHeight - padding }
    }
  }

  const applyWatermark = async () => {
    if (!originalFile || !canvasRef.current) return
    if (watermarkType === "text" && !watermarkText.trim()) return
    if (watermarkType === "image" && !watermarkFile) return

    setIsProcessing(true)
    setProgress(0)

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = async () => {
        // Set canvas size to match image
        canvas.width = img.width
        canvas.height = img.height

        // Simulate progress
        let currentProgress = 0
        const progressInterval = setInterval(() => {
          currentProgress += 20
          setProgress(currentProgress)
          if (currentProgress >= 100) {
            clearInterval(progressInterval)
          }
        }, 150)

        // Draw original image
        ctx.drawImage(img, 0, 0)

        // Set watermark opacity
        ctx.globalAlpha = opacity[0] / 100

        if (watermarkType === "text") {
          // Apply text watermark
          ctx.font = `${fontSize[0]}px Arial`
          ctx.fillStyle = textColor
          ctx.textBaseline = "top"

          const textMetrics = ctx.measureText(watermarkText)
          const textWidth = textMetrics.width
          const textHeight = fontSize[0]

          const pos = getWatermarkPosition(img.width, img.height, textWidth, textHeight)

          // Add text shadow for better visibility
          ctx.shadowColor = textColor === "#ffffff" ? "#000000" : "#ffffff"
          ctx.shadowBlur = 2
          ctx.shadowOffsetX = 1
          ctx.shadowOffsetY = 1

          ctx.fillText(watermarkText, pos.x, pos.y)
        } else if (watermarkType === "image" && watermarkFile) {
          // Apply image watermark
          const watermarkImg = new Image()
          watermarkImg.crossOrigin = "anonymous"

          watermarkImg.onload = () => {
            const maxSize = Math.min(img.width, img.height) * 0.2 // 20% of image size
            const scale = Math.min(maxSize / watermarkImg.width, maxSize / watermarkImg.height)
            const watermarkWidth = watermarkImg.width * scale
            const watermarkHeight = watermarkImg.height * scale

            const pos = getWatermarkPosition(img.width, img.height, watermarkWidth, watermarkHeight)

            ctx.drawImage(watermarkImg, pos.x, pos.y, watermarkWidth, watermarkHeight)

            // Finish processing
            finishWatermarking()
          }

          watermarkImg.src = watermarkPreview
          return
        }

        finishWatermarking()
      }

      const finishWatermarking = () => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const fileName = originalFile.name.replace(/\.[^/.]+$/, "") + "_watermarked.jpg"
              const file = new File([blob], fileName, {
                type: "image/jpeg",
              })
              setWatermarkedFile(file)
              const url = URL.createObjectURL(blob)
              setWatermarkedPreview(url)
            }
            setIsProcessing(false)
          },
          "image/jpeg",
          0.9,
        )
      }

      img.src = originalPreview
    } catch (error) {
      console.error("Watermarking failed:", error)
      setIsProcessing(false)
    }
  }

  const downloadWatermarked = () => {
    if (watermarkedFile) {
      const a = document.createElement("a")
      a.href = watermarkedPreview
      a.download = watermarkedFile.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const canApplyWatermark =
    originalFile && ((watermarkType === "text" && watermarkText.trim()) || (watermarkType === "image" && watermarkFile))

  return (
    <>
      {/* Schema Markup */}
      <Script id="image-watermarker-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Image Watermarker",
          description:
            "Free online image watermarker tool to add watermarks to protect your images. Add text or image watermarks with custom positioning.",
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/image-watermarker`,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: [
            "Text watermarks",
            "Image watermarks",
            "Custom positioning",
            "Opacity control",
            "Font customization",
          ],
        })}
      </Script>

      <canvas ref={canvasRef} className="hidden" />

      {/* Main Layout: Sidebar on Right */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-screen pt-6 lg:pt-0">
        {/* Main Content - Left */}
        <main className="flex-1 lg:w-3/4 space-y-6">
          {/* Offset to prevent header overlap */}
          <div id="top" className="h-16"></div>

          {/* Header - Non-Sticky */}
          <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2 text-2xl">
                <Droplets className="w-6 h-6 text-cyan-400" />
                Image Watermarker
                <Badge className="bg-cyan-400/20 text-cyan-600 dark:text-cyan-400">New</Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Add watermarks to protect your images with text or logo overlays and custom positioning.
              </p>
            </CardHeader>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Upload className="w-5 h-5 text-cyan-400" />
                  Upload Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!originalFile ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                      isDragOver ? "border-cyan-400 bg-cyan-400/10" : "border-border hover:border-cyan-400/50"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 text-muted-foreground/80 mx-auto mb-4" />
                    <p className="text-foreground text-lg mb-2">Drop your image here</p>
                    <p className="text-muted-foreground/80 mb-4">Supports JPEG, PNG, WebP</p>
                    <Button variant="outline" className="bg-white/10 border-white/30 text-foreground hover:bg-white/20">
                      Choose File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden">
                      <img
                        src={originalPreview || "/placeholder.svg"}
                        alt="Original"
                        className="w-full h-48 object-contain bg-black/5"
                      />
                      <Badge className="absolute top-2 left-2 bg-cyan-500/20 text-cyan-300">Original</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span className="text-foreground font-medium">{formatFileSize(originalFile.size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Format:</span>
                        <span className="text-foreground font-medium">
                          {originalFile.type.split("/")[1].toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Settings & Result */}
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Watermark Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {originalFile && (
                  <>
                    {/* Watermark Type */}
                    <Tabs value={watermarkType} onValueChange={(value) => setWatermarkType(value as "text" | "image")}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="text" className="flex items-center gap-2">
                          <Type className="w-4 h-4" />
                          Text
                        </TabsTrigger>
                        <TabsTrigger value="image" className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          Image
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="text" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label className="text-foreground">Watermark Text</Label>
                          <Textarea
                            value={watermarkText}
                            onChange={(e) => setWatermarkText(e.target.value)}
                            placeholder="Enter your watermark text..."
                            rows={2}
                            className="bg-card/50 border-border text-foreground resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-foreground">Font Size: {fontSize[0]}px</Label>
                            <Slider
                              value={fontSize}
                              onValueChange={setFontSize}
                              max={72}
                              min={12}
                              step={2}
                              className="[&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-cyan-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-foreground">Text Color</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={textColor}
                                onChange={(e) => setTextColor(e.target.value)}
                                className="w-12 h-10 p-1 bg-card/50 border-border"
                              />
                              <Input
                                type="text"
                                value={textColor}
                                onChange={(e) => setTextColor(e.target.value)}
                                className="flex-1 bg-card/50 border-border text-foreground"
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="image" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label className="text-foreground">Watermark Image</Label>
                          <div
                            className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-cyan-400/50 transition-colors"
                            onClick={() => watermarkInputRef.current?.click()}
                          >
                            {!watermarkFile ? (
                              <>
                                <ImageIcon className="w-8 h-8 text-muted-foreground/80 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Click to select watermark image</p>
                              </>
                            ) : (
                              <div className="space-y-2">
                                <img
                                  src={watermarkPreview || "/placeholder.svg"}
                                  alt="Watermark"
                                  className="w-16 h-16 object-contain mx-auto"
                                />
                                <p className="text-sm text-foreground">{watermarkFile.name}</p>
                              </div>
                            )}
                          </div>
                          <input
                            ref={watermarkInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleWatermarkSelect(e.target.files[0])}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Common Settings */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-foreground">Position</Label>
                        <Select value={position} onValueChange={setPosition}>
                          <SelectTrigger className="bg-card/50 border-border text-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {positions.map((pos) => (
                              <SelectItem key={pos.value} value={pos.value}>
                                {pos.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-foreground">Opacity: {opacity[0]}%</Label>
                        <Slider
                          value={opacity}
                          onValueChange={setOpacity}
                          max={100}
                          min={10}
                          step={5}
                          className="[&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-cyan-500"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={applyWatermark}
                      disabled={isProcessing || !canApplyWatermark}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Adding Watermark...
                        </>
                      ) : (
                        <>
                          <Droplets className="w-4 h-4 mr-2" />
                          Apply Watermark
                        </>
                      )}
                    </Button>

                    {isProcessing && <Progress value={progress} className="h-2" />}

                    {watermarkedFile && (
                      <div className="space-y-4">
                        <div className="relative rounded-lg overflow-hidden">
                          <img
                            src={watermarkedPreview || "/placeholder.svg"}
                            alt="Watermarked"
                            className="w-full h-48 object-contain bg-black/5"
                          />
                          <Badge className="absolute top-2 left-2 bg-green-500/20 text-green-300">Watermarked</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">New Size:</span>
                            <span className="text-foreground font-medium">{formatFileSize(watermarkedFile.size)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Watermark:</span>
                            <span className="text-foreground font-medium">
                              {watermarkType === "text" ? "Text" : "Image"}
                            </span>
                          </div>
                        </div>

                        <Button
                          onClick={downloadWatermarked}
                          className="w-full bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Watermarked
                        </Button>
                      </div>
                    )}
                  </>
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
                    How to Add Watermarks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    {[
                      {
                        step: 1,
                        title: "Upload Your Image",
                        description: "Drag and drop or click to select the image you want to watermark",
                      },
                      {
                        step: 2,
                        title: "Choose Watermark Type",
                        description: "Select between text watermark or upload an image/logo watermark",
                      },
                      {
                        step: 3,
                        title: "Customize Settings",
                        description: "Adjust position, opacity, size, and other watermark properties",
                      },
                      {
                        step: 4,
                        title: "Apply & Download",
                        description: "Process your watermark and download the protected image",
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
                        title: "Text & Image Watermarks",
                        description: "Add custom text or upload logo/image watermarks",
                      },
                      {
                        icon: CheckCircle,
                        title: "9-Point Positioning",
                        description: "Place watermarks in any of 9 preset positions",
                      },
                      {
                        icon: CheckCircle,
                        title: "Opacity Control",
                        description: "Adjust transparency from 10% to 100%",
                      },
                      {
                        icon: CheckCircle,
                        title: "Font Customization",
                        description: "Control text size, color, and styling options",
                      },
                    ].map((feature, index) => (
                      <div key={index} className="flex gap-3">
                        {feature.icon && <feature.icon className="w-5 h-5 text-green-400 mt-1" />}
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
                      <h4 className="font-semibold text-foreground mb-1">Subtle Protection</h4>
                      <p className="text-sm text-muted-foreground">
                        Use 30-50% opacity for watermarks that protect without being too distracting.
                      </p>
                    </div>
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Logo Watermarks</h4>
                      <p className="text-sm text-muted-foreground">
                        Use PNG logos with transparent backgrounds for the best watermark results.
                      </p>
                    </div>
                    <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Text Contrast</h4>
                      <p className="text-sm text-muted-foreground">
                        Use white text on dark images and dark text on light images for better visibility.
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
