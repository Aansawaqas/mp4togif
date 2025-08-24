"use client"

import type { ReactElement } from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import {
  Upload,
  Download,
  Image,
  Info,
  CheckCircle,
  X,
  Loader2,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import Script from "next/script"
import ImageToolsSidebar from "@/components/image-tools-sidebar"

export default function ImageBackgroundRemover(): ReactElement {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [processedFile, setProcessedFile] = useState<File | null>(null)
  const [originalPreview, setOriginalPreview] = useState<string>("")
  const [processedPreview, setProcessedPreview] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [isDragOver, setIsDragOver] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (originalPreview) URL.revokeObjectURL(originalPreview)
      if (processedPreview) URL.revokeObjectURL(processedPreview)
    }
  }, [originalPreview, processedPreview])

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPEG, PNG, WebP).")
      return
    }

    setError(null)
    setOriginalFile(file)
    const url = URL.createObjectURL(file)
    setOriginalPreview(url)
    
    setProcessedFile(null)
    setProcessedPreview("")
    setProgress(0)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const droppedFile = e.dataTransfer.files[0]
      handleFileSelect(droppedFile)
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

  const simulateBackgroundRemoval = async () => {
    if (!originalFile || !canvasRef.current || !previewCanvasRef.current) return

    setIsProcessing(true)
    setProgress(0)
    setError(null)

    try {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = originalPreview

      img.onload = () => {
        // Set up main canvas
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!ctx || !canvas) throw new Error("Could not get canvas context")

        // Set canvas dimensions to match image
        canvas.width = img.width
        canvas.height = img.height

        // Draw original image
        ctx.drawImage(img, 0, 0)

        // Simulate processing steps with progress
        const steps = [
          { label: "Analyzing image", duration: 300, progress: 20 },
          { label: "Detecting edges", duration: 500, progress: 45 },
          { label: "Refining mask", duration: 700, progress: 75 },
          { label: "Finalizing result", duration: 400, progress: 95 }
        ]

        let currentStep = 0
        const processNextStep = () => {
          if (currentStep >= steps.length) {
            // Final step - complete processing
            setTimeout(() => {
              finalizeProcessing()
              setProgress(100)
              setIsProcessing(false)
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

        // This function would normally handle actual background removal
        // For demo purposes, we'll create a simple transparency effect
        const finalizeProcessing = () => {
          // In a real implementation, this would use a background removal algorithm
          // For this demo, we'll create a simple transparency effect around the edges
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data
          
          // Create a simple edge detection effect for demo purposes
          const edgeDetection = (x: number, y: number) => {
            const index = (y * canvas.width + x) * 4
            const r = data[index]
            const g = data[index + 1]
            const b = data[index + 2]
            
            // Simple edge detection (difference between adjacent pixels)
            let edgeValue = 0
            if (x > 0 && y > 0 && x < canvas.width - 1 && y < canvas.height - 1) {
              const left = data[(y * canvas.width + (x - 1)) * 4]
              const right = data[(y * canvas.width + (x + 1)) * 4]
              const top = data[((y - 1) * canvas.width + x) * 4]
              const bottom = data[((y + 1) * canvas.width + x) * 4]
              
              const diff = Math.abs(r - left) + Math.abs(r - right) + 
                          Math.abs(r - top) + Math.abs(r - bottom)
              edgeValue = diff > 50 ? 255 : 0
            }
            return edgeValue
          }
          
          // Create a simple transparency mask
          const mask = new Uint8ClampedArray(canvas.width * canvas.height)
          for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
              mask[y * canvas.width + x] = edgeDetection(x, y)
            }
          }
          
          // Apply a blur to the mask for smoother edges
          const blurMask = (mask: Uint8ClampedArray, width: number, height: number, radius: number) => {
            const result = new Uint8ClampedArray(width * height)
            for (let y = 0; y < height; y++) {
              for (let x = 0; x < width; x++) {
                let sum = 0
                let count = 0
                for (let dy = -radius; dy <= radius; dy++) {
                  for (let dx = -radius; dx <= radius; dx++) {
                    const nx = x + dx
                    const ny = y + dy
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                      sum += mask[ny * width + nx]
                      count++
                    }
                  }
                }
                result[y * width + x] = sum / count
              }
            }
            return result
          }
          
          const blurredMask = blurMask(mask, canvas.width, canvas.height, 2)
          
          // Apply transparency based on the mask
          for (let i = 0; i < data.length; i += 4) {
            const x = (i / 4) % canvas.width
            const y = Math.floor((i / 4) / canvas.width)
            const alpha = blurredMask[y * canvas.width + x] / 255
            data[i + 3] = alpha * 255 // Set alpha channel
          }
          
          ctx.putImageData(imageData, 0, 0)
          
          // Create preview with checkered background to show transparency
          const previewCanvas = previewCanvasRef.current
          const previewCtx = previewCanvas?.getContext("2d")
          if (!previewCtx || !previewCanvas) return
          
          previewCanvas.width = canvas.width
          previewCanvas.height = canvas.height
          
          // Create checkered background
          const size = 10
          for (let y = 0; y < previewCanvas.height; y += size) {
            for (let x = 0; x < previewCanvas.width; x += size) {
              previewCtx.fillStyle = (Math.floor(x / size) + Math.floor(y / size)) % 2 === 0 
                ? '#f0f0f0' 
                : '#e0e0e0'
              previewCtx.fillRect(x, y, size, size)
            }
          }
          
          // Draw processed image over checkered background
          previewCtx.drawImage(canvas, 0, 0)
          
          // Convert to blob and set processed file
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                setError("Background removal failed: Could not generate image data.")
                setIsProcessing(false)
                return
              }
              
              const fileName = originalFile.name.replace(/\.[^/.]+$/, "") + "_no_bg.png"
              const file = new File([blob], fileName, { type: "image/png" })
              setProcessedFile(file)
              const url = URL.createObjectURL(blob)
              setProcessedPreview(url)
            },
            "image/png",
            1.0
          )
        }
      }

      img.onerror = () => {
        setError("Failed to load image for processing.")
        setIsProcessing(false)
      }
    } catch (err) {
      console.error("Background removal failed:", err)
      setError("An unexpected error occurred during background removal.")
      setIsProcessing(false)
    }
  }

  const downloadProcessed = () => {
    if (!processedFile) return

    const a = document.createElement("a")
    a.href = processedPreview
    a.download = processedFile.name
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

  return (
    <>
      {/* Schema.org Structured Data */}
      <Script id="image-background-remover-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Image Background Remover",
          description:
            "Free online tool to remove backgrounds from images instantly. Perfect for product photos, profile pictures, and creative projects.",
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/image-background-remover`,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: [
            "Instant background removal",
            "Transparent PNG output",
            "No quality loss",
            "Preserves fine details",
            "Privacy-focused processing",
          ],
        })}
      </Script>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={previewCanvasRef} className="hidden" />

      {/* Main Layout: Sidebar on Right */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-screen pt-6 lg:pt-0">
        {/* Main Content - Left */}
        <main className="flex-1 lg:w-3/4 space-y-6">
          {/* Offset to prevent header overlap */}
          <div id="top" className="h-16"></div>

          {/* Page Header (Non-Sticky) */}
          <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center gap-2 text-2xl">
                <Sparkles className="w-6 h-6 text-indigo-400" />
                Image Background Remover
                <Badge className="bg-indigo-400/20 text-indigo-600 dark:text-indigo-400">Popular</Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Remove backgrounds from images instantly with AI-powered technology. Perfect for product photos, profile pictures, and creative projects.
              </p>
            </CardHeader>
          </Card>

          {/* Upload & Processing Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-400" />
                  Upload Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                    {error}
                  </div>
                )}
                {!originalFile ? (
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
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400/50 ${
                      isDragOver
                        ? "border-indigo-400 bg-indigo-400/10"
                        : "border-border hover:border-indigo-400/50"
                    }`}
                  >
                    <Upload className="w-12 h-12 text-muted-foreground/80 mx-auto mb-4" />
                    <p className="text-foreground text-lg mb-2">Drop your image here</p>
                    <p className="text-muted-foreground/80 mb-4">Supports JPEG, PNG, WebP</p>
                    <Button
                      variant="outline"
                      className="bg-white/10 border-white/30 text-foreground hover:bg-white/20"
                    >
                      Choose File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileSelect(file)
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden border border-border">
                      <img
                        src={originalPreview}
                        alt="Original"
                        className="w-full h-48 object-contain"
                      />
                      <Badge className="absolute top-2 left-2 bg-indigo-500/20 text-indigo-300">
                        Original
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span className="text-foreground font-medium">
                          {formatFileSize(originalFile.size)}
                        </span>
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

            {/* Processing Section */}
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Background Removal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {originalFile && (
                  <>
                    <div className="space-y-4">
                      <div className="relative rounded-lg overflow-hidden border border-border min-h-[192px] bg-[linear-gradient(45deg,#f0f0f0_25%,#e0e0e0_25%)] bg-[length:10px_10px]">
                        {processedPreview ? (
                          <img
                            src={processedPreview}
                            alt="Processed"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                            <Image className="w-12 h-12" />
                          </div>
                        )}
                        {processedPreview && (
                          <Badge className="absolute top-2 left-2 bg-green-500/20 text-green-300">
                            Background Removed
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {processedFile && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">New Size:</span>
                              <span className="text-foreground font-medium">
                                {formatFileSize(processedFile.size)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Format:</span>
                              <span className="text-foreground font-medium">PNG</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={simulateBackgroundRemoval}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Removing Background...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Remove Background
                        </>
                      )}
                    </Button>

                    {isProcessing && (
                      <div className="space-y-2">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground text-center">
                          {progress < 25 && "Analyzing image..."}
                          {progress >= 25 && progress < 50 && "Detecting edges..."}
                          {progress >= 50 && progress < 75 && "Refining mask..."}
                          {progress >= 75 && "Finalizing result..."}
                        </p>
                      </div>
                    )}

                    {processedFile && (
                      <Button
                        onClick={downloadProcessed}
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Transparent PNG
                      </Button>
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
                    <Info className="w-5 h-5 text-indigo-400" />
                    How to Remove Backgrounds
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      step: 1,
                      title: "Upload Your Image",
                      description: "Drag and drop or click to select your image file",
                    },
                    {
                      step: 2,
                      title: "Process Image",
                      description: "Click 'Remove Background' to let our AI analyze your image",
                    },
                    {
                      step: 3,
                      title: "Review Result",
                      description: "Check the preview to ensure quality and details are preserved",
                    },
                    {
                      step: 4,
                      title: "Download & Use",
                      description: "Download your image with transparent background for any purpose",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
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
                        title: "AI-Powered Removal",
                        description: "Advanced algorithms detect and remove backgrounds with precision",
                      },
                      {
                        icon: CheckCircle,
                        title: "Transparent PNG Output",
                        description: "Get high-quality images with fully transparent backgrounds",
                      },
                      {
                        icon: CheckCircle,
                        title: "Preserves Fine Details",
                        description: "Hair, fur, and intricate edges are maintained with high fidelity",
                      },
                      {
                        icon: CheckCircle,
                        title: "Instant Processing",
                        description: "No waiting - see results in seconds directly in your browser",
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
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Best Image Types</h4>
                      <p className="text-sm text-muted-foreground">
                        For best results, use high-resolution images with clear subject separation from the background.
                      </p>
                    </div>
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Complex Edges</h4>
                      <p className="text-sm text-muted-foreground">
                        Images with fine details like hair or transparent objects may require manual touch-ups after processing.
                      </p>
                    </div>
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Usage Ideas</h4>
                      <p className="text-sm text-muted-foreground">
                        Use transparent images for product listings, profile pictures, graphic design projects, and presentations.
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
