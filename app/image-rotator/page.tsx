"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { RotateCcw, Upload, Download, Info, CheckCircle, RotateCw, FlipHorizontal, FlipVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Script from "next/script"

export default function ImageRotator() {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [rotatedFile, setRotatedFile] = useState<File | null>(null)
  const [originalPreview, setOriginalPreview] = useState<string>("")
  const [rotatedPreview, setRotatedPreview] = useState<string>("")
  const [rotation, setRotation] = useState([0])
  const [flipHorizontal, setFlipHorizontal] = useState(false)
  const [flipVertical, setFlipVertical] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      setOriginalFile(file)
      const url = URL.createObjectURL(file)
      setOriginalPreview(url)
      setRotatedFile(null)
      setRotatedPreview("")
      setProgress(0)
      setRotation([0])
      setFlipHorizontal(false)
      setFlipVertical(false)
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

  const quickRotate = (degrees: number) => {
    setRotation([degrees])
  }

  const toggleFlipHorizontal = () => {
    setFlipHorizontal(!flipHorizontal)
  }

  const toggleFlipVertical = () => {
    setFlipVertical(!flipVertical)
  }

  const resetTransforms = () => {
    setRotation([0])
    setFlipHorizontal(false)
    setFlipVertical(false)
  }

  const rotateImage = async () => {
    if (!originalFile || !canvasRef.current) return

    setIsRotating(true)
    setProgress(0)

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        // Simulate progress
        let currentProgress = 0
        const progressInterval = setInterval(() => {
          currentProgress += 20
          setProgress(currentProgress)
          if (currentProgress >= 100) {
            clearInterval(progressInterval)
          }
        }, 100)

        const angle = (rotation[0] * Math.PI) / 180

        // Calculate new canvas dimensions after rotation
        const cos = Math.abs(Math.cos(angle))
        const sin = Math.abs(Math.sin(angle))
        const newWidth = img.width * cos + img.height * sin
        const newHeight = img.width * sin + img.height * cos

        canvas.width = newWidth
        canvas.height = newHeight

        // Clear canvas
        ctx.clearRect(0, 0, newWidth, newHeight)

        // Move to center
        ctx.translate(newWidth / 2, newHeight / 2)

        // Apply transformations
        ctx.rotate(angle)

        // Apply flips
        const scaleX = flipHorizontal ? -1 : 1
        const scaleY = flipVertical ? -1 : 1
        ctx.scale(scaleX, scaleY)

        // Draw image centered
        ctx.drawImage(img, -img.width / 2, -img.height / 2)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const fileName = originalFile.name.replace(/\.[^/.]+$/, "") + "_rotated.jpg"
              const file = new File([blob], fileName, {
                type: "image/jpeg",
              })
              setRotatedFile(file)
              const url = URL.createObjectURL(blob)
              setRotatedPreview(url)
            }
            setIsRotating(false)
          },
          "image/jpeg",
          0.9,
        )
      }

      img.onerror = () => {
        console.error("Failed to load image")
        setIsRotating(false)
      }

      img.src = originalPreview
    } catch (error) {
      console.error("Rotation failed:", error)
      setIsRotating(false)
    }
  }

  const downloadRotated = () => {
    if (rotatedFile) {
      const a = document.createElement("a")
      a.href = rotatedPreview
      a.download = rotatedFile.name
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

  const hasTransforms = rotation[0] !== 0 || flipHorizontal || flipVertical

  return (
    <>
      {/* Schema Markup */}
      <Script id="image-rotator-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Image Rotator",
          description:
            "Free online image rotator tool to rotate images to any angle. Rotate JPEG, PNG, WebP images with precision controls.",
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/image-rotator`,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: [
            "Custom angle rotation",
            "Quick 90° rotations",
            "Flip horizontal/vertical",
            "High quality output",
            "Real-time preview",
          ],
        })}
      </Script>

      <canvas ref={canvasRef} className="hidden" />

      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 border-pink-500/20">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <RotateCcw className="w-6 h-6 text-pink-400" />
              Image Rotator
              <Badge className="bg-pink-400/20 text-pink-600 dark:text-pink-400">New</Badge>
            </CardTitle>
            <p className="text-muted-foreground">
              Rotate images to any angle with precision controls and quick rotation presets.
            </p>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="bg-card/50 backdrop-blur-lg border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Upload className="w-5 h-5 text-pink-400" />
                Upload Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!originalFile ? (
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
                      style={{
                        transform: `rotate(${rotation[0]}deg) scaleX(${flipHorizontal ? -1 : 1}) scaleY(${flipVertical ? -1 : 1})`,
                        transition: "transform 0.3s ease",
                      }}
                    />
                    <Badge className="absolute top-2 left-2 bg-pink-500/20 text-pink-300">Preview</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span className="text-foreground font-medium">{formatFileSize(originalFile.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rotation:</span>
                      <span className="text-foreground font-medium">{rotation[0]}°</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings & Result */}
          <Card className="bg-card/50 backdrop-blur-lg border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Rotation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {originalFile && (
                <>
                  {/* Quick Rotation Buttons */}
                  <div className="space-y-2">
                    <Label className="text-foreground">Quick Rotations</Label>
                    <div className="grid grid-cols-4 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => quickRotate(0)}
                        className={`${rotation[0] === 0 ? "bg-pink-500/20 border-pink-500/50" : ""}`}
                      >
                        0°
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => quickRotate(90)}
                        className={`${rotation[0] === 90 ? "bg-pink-500/20 border-pink-500/50" : ""}`}
                      >
                        90°
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => quickRotate(180)}
                        className={`${rotation[0] === 180 ? "bg-pink-500/20 border-pink-500/50" : ""}`}
                      >
                        180°
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => quickRotate(270)}
                        className={`${rotation[0] === 270 ? "bg-pink-500/20 border-pink-500/50" : ""}`}
                      >
                        270°
                      </Button>
                    </div>
                  </div>

                  {/* Custom Rotation */}
                  <div className="space-y-2">
                    <Label className="text-foreground">Custom Rotation: {rotation[0]}°</Label>
                    <Slider
                      value={rotation}
                      onValueChange={setRotation}
                      max={360}
                      min={0}
                      step={1}
                      className="[&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-pink-500"
                    />
                  </div>

                  {/* Flip Options */}
                  <div className="space-y-2">
                    <Label className="text-foreground">Flip Options</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleFlipHorizontal}
                        className={`flex-1 ${flipHorizontal ? "bg-pink-500/20 border-pink-500/50" : ""}`}
                      >
                        <FlipHorizontal className="w-4 h-4 mr-2" />
                        Horizontal
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleFlipVertical}
                        className={`flex-1 ${flipVertical ? "bg-pink-500/20 border-pink-500/50" : ""}`}
                      >
                        <FlipVertical className="w-4 h-4 mr-2" />
                        Vertical
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={rotateImage}
                      disabled={isRotating || !hasTransforms}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold"
                    >
                      {isRotating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <RotateCw className="w-4 h-4 mr-2" />
                          Apply Changes
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={resetTransforms}
                      variant="outline"
                      disabled={!hasTransforms}
                      className="bg-white/10 border-white/30 text-foreground hover:bg-white/20"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>

                  {isRotating && <Progress value={progress} className="h-2" />}

                  {rotatedFile && (
                    <div className="space-y-4">
                      <div className="relative rounded-lg overflow-hidden">
                        <img
                          src={rotatedPreview || "/placeholder.svg"}
                          alt="Rotated"
                          className="w-full h-48 object-contain bg-black/5"
                        />
                        <Badge className="absolute top-2 left-2 bg-green-500/20 text-green-300">Processed</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">New Size:</span>
                          <span className="text-foreground font-medium">{formatFileSize(rotatedFile.size)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Applied:</span>
                          <span className="text-foreground font-medium">
                            {rotation[0]}° {flipHorizontal ? "H" : ""} {flipVertical ? "V" : ""}
                          </span>
                        </div>
                      </div>

                      <Button onClick={downloadRotated} className="w-full bg-green-500 hover:bg-green-600 text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Download Rotated
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
                  <Info className="w-5 h-5 text-pink-400" />
                  How to Rotate Images
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
                      title: "Choose Rotation",
                      description: "Use quick buttons for 90° increments or slider for custom angles",
                    },
                    {
                      step: 3,
                      title: "Add Flips (Optional)",
                      description: "Apply horizontal or vertical flips as needed",
                    },
                    {
                      step: 4,
                      title: "Apply & Download",
                      description: "Process your changes and download the rotated image",
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
                      title: "Custom Angles",
                      description: "Rotate to any degree from 0° to 360° with precision",
                    },
                    {
                      icon: CheckCircle,
                      title: "Quick Presets",
                      description: "90°, 180°, 270° rotations with one click",
                    },
                    {
                      icon: CheckCircle,
                      title: "Flip Options",
                      description: "Horizontal and vertical flipping capabilities",
                    },
                    {
                      icon: CheckCircle,
                      title: "Live Preview",
                      description: "See changes in real-time before processing",
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
                    <h4 className="font-semibold text-foreground mb-1">Photo Orientation</h4>
                    <p className="text-sm text-muted-foreground">
                      Use 90° rotations to fix photos taken in portrait mode that appear sideways.
                    </p>
                  </div>
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">Creative Effects</h4>
                    <p className="text-sm text-muted-foreground">
                      Combine rotation with flips to create unique perspectives and artistic effects.
                    </p>
                  </div>
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">Quality Preservation</h4>
                    <p className="text-sm text-muted-foreground">
                      The tool maintains image quality during rotation by using high-quality interpolation.
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
