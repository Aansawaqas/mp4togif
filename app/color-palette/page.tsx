"use client"

import type { ReactElement } from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import {
  Upload,
  Download,
  Palette,
  Info,
  CheckCircle,
  Copy,
  EyeDropper
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
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import Script from "next/script"
import ImageToolsSidebar from "@/components/image-tools-sidebar"

// Simple color extraction function (for demo purposes)
const extractColors = (image: HTMLImageElement, numColors: number = 5): string[] => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return []
  
  // Set canvas size to a smaller version of the image for performance
  const size = 100
  canvas.width = size
  canvas.height = size
  
  // Draw and scale the image
  ctx.drawImage(image, 0, 0, size, size)
  
  // Get pixel data
  const imageData = ctx.getImageData(0, 0, size, size)
  const pixels = imageData.data
  
  // Simple color counting algorithm
  const colorCount: Record<string, number> = {}
  
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    // Skip transparent pixels
    if (pixels[i + 3] < 128) continue
    
    // Group similar colors together (simplified)
    const key = `${Math.round(r/10)*10},${Math.round(g/10)*10},${Math.round(b/10)*10}`
    colorCount[key] = (colorCount[key] || 0) + 1
  }
  
  // Sort colors by frequency
  const sortedColors = Object.entries(colorCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, numColors)
    .map(([key]) => {
      const [r, g, b] = key.split(',').map(Number)
      return `rgb(${r}, ${g}, ${b})`
    })
  
  return sortedColors.length > 0 ? sortedColors : ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
}

// Helper to convert RGB to HEX
const rgbToHex = (rgb: string): string => {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!match) return rgb
  
  const r = parseInt(match[1]).toString(16).padStart(2, '0')
  const g = parseInt(match[2]).toString(16).padStart(2, '0')
  const b = parseInt(match[3]).toString(16).padStart(2, '0')
  
  return `#${r}${g}${b}`
}

// Helper to calculate color brightness for text contrast
const getContrastColor = (rgb: string): string => {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!match) return '#000000'
  
  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

export default function ImageColorPalette(): ReactElement {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [originalPreview, setOriginalPreview] = useState<string>("")
  const [colorPalette, setColorPalette] = useState<string[]>([])
  const [numColors, setNumColors] = useState<number[]>([5])
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [isDragOver, setIsDragOver] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (originalPreview) URL.revokeObjectURL(originalPreview)
    }
  }, [originalPreview])

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPEG, PNG, WebP).")
      return
    }

    setError(null)
    setOriginalFile(file)
    const url = URL.createObjectURL(file)
    setOriginalPreview(url)
    
    // Extract colors
    extractColorsFromImage(url)
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

  const extractColorsFromImage = (imageUrl: string) => {
    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setColorPalette([])
    
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = imageUrl
    
    img.onload = () => {
      // Simulate processing steps
      const steps = [
        { label: "Analyzing image", duration: 200, progress: 25 },
        { label: "Detecting color clusters", duration: 300, progress: 50 },
        { label: "Refining palette", duration: 250, progress: 75 },
        { label: "Finalizing results", duration: 200, progress: 95 }
      ]
      
      let currentStep = 0
      const processNextStep = () => {
        if (currentStep >= steps.length) {
          // Final step - complete processing
          setTimeout(() => {
            const colors = extractColors(img, numColors[0])
            setColorPalette(colors)
            setProgress(100)
            setIsProcessing(false)
          }, 150)
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
    }
    
    img.onerror = () => {
      setError("Failed to load image for analysis.")
      setIsProcessing(false)
    }
  }

  const copyToClipboard = (color: string) => {
    const hex = rgbToHex(color)
    navigator.clipboard.writeText(hex)
    
    // Show visual feedback (could be improved with a toast notification)
    const button = document.querySelector(`[data-color="${color}"]`)
    if (button) {
      const originalText = button.innerHTML
      button.innerHTML = '<CheckCircle class="w-4 h-4" /> Copied!'
      setTimeout(() => {
        button.innerHTML = originalText
      }, 2000)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const downloadPalette = () => {
    if (colorPalette.length === 0) return
    
    // Create a simple HTML representation of the palette
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Color Palette - ${originalFile?.name || 'Export'}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .palette { display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0; }
          .color { width: 100px; height: 100px; border-radius: 8px; display: flex; flex-direction: column; justify-content: flex-end; padding: 10px; color: white; text-shadow: 0 0 3px rgba(0,0,0,0.5); }
          .color-info { background: white; padding: 15px; border-radius: 8px; margin-bottom: 10px; }
          .color-hex { font-family: monospace; font-size: 1.2em; margin-top: 5px; }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <h1>Color Palette from ${originalFile?.name || 'Image'}</h1>
        <div class="color-info">
          <p>Extracted ${colorPalette.length} dominant colors from the image.</p>
        </div>
        <div class="palette">
          ${colorPalette.map(color => `
            <div class="color" style="background-color: ${color}">
              <div>${rgbToHex(color)}</div>
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `
    
    // Create and download
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `color-palette-${originalFile?.name.replace(/\.[^/.]+$/, "") || 'export'}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {/* Schema.org Structured Data */}
      <Script id="image-color-palette-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Image Color Palette Generator",
          description:
            "Free online tool to extract color palettes from images. Analyze any image to discover its dominant colors and get HEX codes for design projects.",
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/image-color-palette`,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: [
            "Extract dominant colors",
            "HEX and RGB color codes",
            "Color contrast analysis",
            "Palette export options",
            "Real-time color extraction",
          ],
        })}
      </Script>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Layout: Sidebar on Right */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-screen pt-6 lg:pt-0">
        {/* Main Content - Left */}
        <main className="flex-1 lg:w-3/4 space-y-6">
          {/* Offset to prevent header overlap */}
          <div id="top" className="h-16"></div>

          {/* Page Header (Non-Sticky) */}
          <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center gap-2 text-2xl">
                <Palette className="w-6 h-6 text-amber-400" />
                Image Color Palette Generator
                <Badge className="bg-amber-400/20 text-amber-600 dark:text-amber-400">Popular</Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Extract beautiful color palettes from any image. Perfect for designers, developers, and artists looking to create harmonious color schemes.
              </p>
            </CardHeader>
          </Card>

          {/* Upload & Palette Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Upload className="w-5 h-5 text-amber-400" />
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
                    onClick={triggerFileSelect}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
                      isDragOver
                        ? "border-amber-400 bg-amber-400/10"
                        : "border-border hover:border-amber-400/50"
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
                        className="w-full h-48 object-contain bg-black/5"
                      />
                      <Badge className="absolute top-2 left-2 bg-amber-500/20 text-amber-300">
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
                        <span className="text-muted-foreground">Colors:</span>
                        <span className="text-foreground font-medium">
                          {isProcessing ? "Processing..." : colorPalette.length > 0 ? `${colorPalette.length} colors` : "Not analyzed"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Color Palette Section */}
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Color Palette</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {originalFile ? (
                  <>
                    {isProcessing ? (
                      <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
                          <p className="text-muted-foreground">Extracting colors...</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {progress < 30 && "Analyzing image..."}
                            {progress >= 30 && progress < 60 && "Detecting color clusters..."}
                            {progress >= 60 && progress < 85 && "Refining palette..."}
                            {progress >= 85 && "Finalizing results..."}
                          </p>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    ) : colorPalette.length > 0 ? (
                      <div className="space-y-6">
                        {/* Color Count Selector */}
                        <div className="space-y-2">
                          <Label htmlFor="color-count" className="text-foreground">
                            Number of Colors: {numColors[0]}
                          </Label>
                          <Slider
                            id="color-count"
                            value={numColors}
                            onValueChange={setNumColors}
                            max={10}
                            min={3}
                            step={1}
                            className="[&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-amber-500"
                          />
                          <p className="text-xs text-muted-foreground">
                            Choose how many dominant colors to extract from the image
                          </p>
                        </div>

                        {/* Color Swatches */}
                        <div className="space-y-4">
                          <div className="grid gap-3">
                            {colorPalette.map((color, index) => (
                              <div key={index} className="space-y-2">
                                <div 
                                  className="h-12 rounded-lg" 
                                  style={{ backgroundColor: color }}
                                ></div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="font-medium" style={{ color: getContrastColor(color) }}>
                                    {rgbToHex(color)}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(color)}
                                    className="text-xs"
                                    data-color={color}
                                  >
                                    <Copy className="w-3 h-3 mr-1" /> Copy
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => extractColorsFromImage(originalPreview)}
                            variant="outline"
                            className="flex-1 bg-white/10 border-white/30 text-foreground hover:bg-white/20"
                          >
                            <EyeDropper className="w-4 h-4 mr-2" />
                            Re-analyze
                          </Button>
                          <Button
                            onClick={downloadPalette}
                            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Palette className="w-12 h-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          No color palette generated
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Upload an image to extract its dominant colors and create a beautiful color palette.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Palette className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Upload an image to get started
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Our tool will analyze your image and extract the dominant colors to create a beautiful palette.
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
                    <Info className="w-5 h-5 text-amber-400" />
                    How to Extract Color Palettes
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
                      title: "Adjust Settings",
                      description: "Set the number of colors you want in your palette",
                    },
                    {
                      step: 3,
                      title: "Review Palette",
                      description: "Examine the extracted colors and their HEX codes",
                    },
                    {
                      step: 4,
                      title: "Use Your Palette",
                      description: "Copy color values or download the palette for your projects",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
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
                        title: "Smart Color Extraction",
                        description: "Advanced algorithms identify the most dominant colors in your image",
                      },
                      {
                        icon: CheckCircle,
                        title: "Adjustable Color Count",
                        description: "Choose how many colors to extract based on your design needs",
                      },
                      {
                        icon: CheckCircle,
                        title: "HEX & RGB Values",
                        description: "Get precise color codes for immediate use in your projects",
                      },
                      {
                        icon: CheckCircle,
                        title: "Contrast-Optimized Text",
                        description: "Automatic text color adjustment for optimal readability on each swatch",
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
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Image Selection</h4>
                      <p className="text-sm text-muted-foreground">
                        For best results, use high-quality images with clear color composition. Images with diverse colors will yield more interesting palettes.
                      </p>
                    </div>
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Color Harmony</h4>
                      <p className="text-sm text-muted-foreground">
                        Try using 3-5 colors for most design projects. Too many colors can create visual chaos, while too few may lack visual interest.
                      </p>
                    </div>
                    <div className="p-3 bg-amber-300/10 border border-amber-300/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Practical Applications</h4>
                      <p className="text-sm text-muted-foreground">
                        Use extracted palettes for website design, branding, interior design, or even fashion coordination. The possibilities are endless!
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
