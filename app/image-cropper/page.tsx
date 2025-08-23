"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Crop, Upload, Download, Info, CheckCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Script from "next/script"

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

const aspectRatios = [
  { label: "Free", value: "free" },
  { label: "Square (1:1)", value: "1:1" },
  { label: "Portrait (3:4)", value: "3:4" },
  { label: "Landscape (4:3)", value: "4:3" },
  { label: "Widescreen (16:9)", value: "16:9" },
  { label: "Instagram Post (1:1)", value: "1:1" },
  { label: "Instagram Story (9:16)", value: "9:16" },
  { label: "Facebook Cover (16:9)", value: "16:9" },
]

export default function ImageCropper() {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [croppedFile, setCroppedFile] = useState<File | null>(null)
  const [originalPreview, setOriginalPreview] = useState<string>("")
  const [croppedPreview, setCroppedPreview] = useState<string>("")
  const [cropArea, setCropArea] = useState<CropArea>({ x: 50, y: 50, width: 200, height: 200 })
  const [aspectRatio, setAspectRatio] = useState("free")
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isCropping, setIsCropping] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const cropAreaRef = useRef<HTMLDivElement>(null)

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      setOriginalFile(file)
      const url = URL.createObjectURL(file)
      setOriginalPreview(url)
      setCroppedFile(null)
      setCroppedPreview("")
      setProgress(0)

      // Get image dimensions
      const img = new Image()
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height })
        // Reset crop area to center
        setCropArea({
          x: img.width * 0.25,
          y: img.height * 0.25,
          width: img.width * 0.5,
          height: img.height * 0.5,
        })
      }
      img.src = url
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

  const handleCropAreaChange = (field: keyof CropArea, value: number) => {
    setCropArea((prev) => {
      const newArea = { ...prev, [field]: Math.max(0, value) }

      // Ensure crop area doesn't exceed image bounds
      if (newArea.x + newArea.width > imageSize.width) {
        newArea.x = imageSize.width - newArea.width
      }
      if (newArea.y + newArea.height > imageSize.height) {
        newArea.y = imageSize.height - newArea.height
      }

      return newArea
    })
  }

  const handleAspectRatioChange = (ratio: string) => {
    setAspectRatio(ratio)

    if (ratio !== "free") {
      const [widthRatio, heightRatio] = ratio.split(":").map(Number)
      const aspectValue = widthRatio / heightRatio

      setCropArea((prev) => {
        const newHeight = prev.width / aspectValue
        return {
          ...prev,
          height: Math.min(newHeight, imageSize.height - prev.y),
        }
      })
    }
  }

  const cropImage = async () => {
    if (!originalFile || !canvasRef.current || !imageRef.current) return

    setIsCropping(true)
    setProgress(0)

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Simulate progress
      let currentProgress = 0
      const progressInterval = setInterval(() => {
        currentProgress += 25
        setProgress(currentProgress)
        if (currentProgress >= 100) {
          clearInterval(progressInterval)
        }
      }, 100)

      // Set canvas size to crop area
      canvas.width = cropArea.width
      canvas.height = cropArea.height

      // Draw cropped portion
      ctx.drawImage(
        imageRef.current,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height,
      )

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const fileName = originalFile.name.replace(/\.[^/.]+$/, "") + "_cropped.jpg"
            const file = new File([blob], fileName, {
              type: "image/jpeg",
            })
            setCroppedFile(file)
            const url = URL.createObjectURL(blob)
            setCroppedPreview(url)
          }
          setIsCropping(false)
        },
        "image/jpeg",
        0.9,
      )
    } catch (error) {
      console.error("Crop failed:", error)
      setIsCropping(false)
    }
  }

  const downloadCropped = () => {
    if (croppedFile) {
      const a = document.createElement("a")
      a.href = croppedPreview
      a.download = croppedFile.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const resetCrop = () => {
    if (imageSize.width && imageSize.height) {
      setCropArea({
        x: imageSize.width * 0.25,
        y: imageSize.height * 0.25,
        width: imageSize.width * 0.5,
        height: imageSize.height * 0.5,
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <>
      {/* Schema Markup */}
      <Script id="image-cropper-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Image Cropper",
          description:
            "Free online image cropper tool to crop images to perfect dimensions. Crop JPEG, PNG, WebP images with precision.",
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/image-cropper`,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: [
            "Precision cropping",
            "Aspect ratio presets",
            "Custom crop areas",
            "High quality output",
            "Real-time preview",
          ],
        })}
      </Script>

      <canvas ref={canvasRef} className="hidden" />

      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Crop className="w-6 h-6 text-purple-400" />
              Image Cropper
              <Badge className="bg-purple-400/20 text-purple-600 dark:text-purple-400">New</Badge>
            </CardTitle>
            <p className="text-muted-foreground">
              Crop images to perfect dimensions with precision tools and aspect ratio presets.
            </p>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload & Preview Section */}
          <Card className="bg-card/50 backdrop-blur-lg border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-400" />
                Upload & Crop
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!originalFile ? (
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
                  <div className="relative rounded-lg overflow-hidden bg-black/5">
                    <img
                      ref={imageRef}
                      src={originalPreview || "/placeholder.svg"}
                      alt="Original"
                      className="w-full h-64 object-contain"
                      crossOrigin="anonymous"
                    />
                    <Badge className="absolute top-2 left-2 bg-purple-500/20 text-purple-300">
                      {imageSize.width} × {imageSize.height}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span className="text-foreground font-medium">{formatFileSize(originalFile.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dimensions:</span>
                      <span className="text-foreground font-medium">
                        {imageSize.width} × {imageSize.height}
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
              <CardTitle className="text-foreground">Crop Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {originalFile && (
                <>
                  <div className="space-y-2">
                    <Label className="text-foreground">Aspect Ratio</Label>
                    <Select value={aspectRatio} onValueChange={handleAspectRatioChange}>
                      <SelectTrigger className="bg-card/50 border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {aspectRatios.map((ratio) => (
                          <SelectItem key={ratio.value} value={ratio.value}>
                            {ratio.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">X Position</Label>
                      <Input
                        type="number"
                        value={Math.round(cropArea.x)}
                        onChange={(e) => handleCropAreaChange("x", Number(e.target.value))}
                        className="bg-card/50 border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Y Position</Label>
                      <Input
                        type="number"
                        value={Math.round(cropArea.y)}
                        onChange={(e) => handleCropAreaChange("y", Number(e.target.value))}
                        className="bg-card/50 border-border text-foreground"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Width</Label>
                      <Input
                        type="number"
                        value={Math.round(cropArea.width)}
                        onChange={(e) => handleCropAreaChange("width", Number(e.target.value))}
                        className="bg-card/50 border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Height</Label>
                      <Input
                        type="number"
                        value={Math.round(cropArea.height)}
                        onChange={(e) => handleCropAreaChange("height", Number(e.target.value))}
                        className="bg-card/50 border-border text-foreground"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={cropImage}
                      disabled={isCropping}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
                    >
                      {isCropping ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Cropping...
                        </>
                      ) : (
                        <>
                          <Crop className="w-4 h-4 mr-2" />
                          Crop Image
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={resetCrop}
                      variant="outline"
                      className="bg-white/10 border-white/30 text-foreground hover:bg-white/20"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>

                  {isCropping && <Progress value={progress} className="h-2" />}

                  {croppedFile && (
                    <div className="space-y-4">
                      <div className="relative rounded-lg overflow-hidden">
                        <img
                          src={croppedPreview || "/placeholder.svg"}
                          alt="Cropped"
                          className="w-full h-48 object-contain bg-black/5"
                        />
                        <Badge className="absolute top-2 left-2 bg-green-500/20 text-green-300">Cropped</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">New Size:</span>
                          <span className="text-foreground font-medium">{formatFileSize(croppedFile.size)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dimensions:</span>
                          <span className="text-foreground font-medium">
                            {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
                          </span>
                        </div>
                      </div>

                      <Button onClick={downloadCropped} className="w-full bg-green-500 hover:bg-green-600 text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Download Cropped
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
                  <Info className="w-5 h-5 text-purple-400" />
                  How to Crop Images
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {[
                    {
                      step: 1,
                      title: "Upload Your Image",
                      description: "Drag and drop or click to select your image file",
                    },
                    {
                      step: 2,
                      title: "Choose Aspect Ratio",
                      description: "Select a preset ratio or use free form cropping",
                    },
                    {
                      step: 3,
                      title: "Adjust Crop Area",
                      description: "Set the position and size of your crop area using the controls",
                    },
                    {
                      step: 4,
                      title: "Crop & Download",
                      description: "Click crop to process and download your cropped image",
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
                      title: "Precision Controls",
                      description: "Exact pixel positioning and sizing controls",
                    },
                    {
                      icon: CheckCircle,
                      title: "Aspect Ratio Presets",
                      description: "Common ratios for social media and print",
                    },
                    {
                      icon: CheckCircle,
                      title: "Real-time Preview",
                      description: "See your crop area before processing",
                    },
                    {
                      icon: CheckCircle,
                      title: "High Quality Output",
                      description: "Maintains image quality during cropping",
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
                    <h4 className="font-semibold text-foreground mb-1">Social Media</h4>
                    <p className="text-sm text-muted-foreground">
                      Use preset aspect ratios for perfect social media posts and stories.
                    </p>
                  </div>
                  <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">Composition</h4>
                    <p className="text-sm text-muted-foreground">
                      Follow the rule of thirds - place important elements along the grid lines.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">Quality</h4>
                    <p className="text-sm text-muted-foreground">
                      Start with high-resolution images for best cropping results.
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
