"use client";

import type { ReactElement } from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  Download,
  ImageIcon,
  Info,
  CheckCircle,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import Script from "next/script";
import ImageToolsSidebar from "@/components/image-tools-sidebar";

export default function ImageResizer(): ReactElement {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [resizedFile, setResizedFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string>("");
  const [resizedPreview, setResizedPreview] = useState<string>("");
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [targetWidth, setTargetWidth] = useState<number>(800);
  const [targetHeight, setTargetHeight] = useState<number>(600);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (originalPreview) URL.revokeObjectURL(originalPreview);
      if (resizedPreview) URL.revokeObjectURL(resizedPreview);
    };
  }, [originalPreview, resizedPreview]);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPEG, PNG, WebP).");
      return;
    }

    setError(null);
    setOriginalFile(file);
    const url = URL.createObjectURL(file);
    setOriginalPreview(url);

    // Get image dimensions
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img;
      setOriginalDimensions({ width: naturalWidth, height: naturalHeight });
      setTargetWidth(naturalWidth);
      setTargetHeight(naturalHeight);
    };
    img.onerror = () => {
      setError("Failed to load image. The file may be corrupted.");
    };
    img.src = url;

    setResizedFile(null);
    setResizedPreview("");
    setProgress(0);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      handleFileSelect(droppedFile);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleWidthChange = (width: number) => {
    if (width < 1) return;
    setTargetWidth(width);
    if (maintainAspectRatio && originalDimensions.width > 0 && originalDimensions.height > 0) {
      const aspectRatio = originalDimensions.height / originalDimensions.width;
      setTargetHeight(Math.round(width * aspectRatio));
    }
  };

  const handleHeightChange = (height: number) => {
    if (height < 1) return;
    setTargetHeight(height);
    if (maintainAspectRatio && originalDimensions.width > 0 && originalDimensions.height > 0) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setTargetWidth(Math.round(height * aspectRatio));
    }
  };

  const resizeImage = async () => {
    if (!originalFile || !canvasRef.current || targetWidth <= 0 || targetHeight <= 0) return;

    setIsResizing(true);
    setProgress(0);
    setError(null);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Set canvas dimensions
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 95) {
              clearInterval(progressInterval);
              return 95;
            }
            return prev + 20;
          });
        }, 100);

        // Draw resized image
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              setError("Resize failed: Could not generate image data.");
              setIsResizing(false);
              return;
            }

            const fileName = `resized_${originalFile.name}`;
            const file = new File([blob], fileName, { type: originalFile.type });
            setResizedFile(file);
            const url = URL.createObjectURL(blob);
            setResizedPreview(url);
            setProgress(100);
            setIsResizing(false);
          },
          originalFile.type,
          0.9
        );
      };

      img.onerror = () => {
        setError("Failed to load image for resizing.");
        setIsResizing(false);
      };

      img.src = originalPreview;
    } catch (err) {
      console.error("Resize failed:", err);
      setError("An unexpected error occurred during resizing.");
      setIsResizing(false);
    }
  };

  const downloadResized = () => {
    if (!resizedFile) return;

    const a = document.createElement("a");
    a.href = resizedPreview;
    a.download = `resized_${originalFile?.name || "image"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const presetSizes = [
    { name: "Instagram Square", width: 1080, height: 1080 },
    { name: "Instagram Story", width: 1080, height: 1920 },
    { name: "Facebook Cover", width: 1200, height: 630 },
    { name: "Twitter Header", width: 1500, height: 500 },
    { name: "YouTube Thumbnail", width: 1280, height: 720 },
    { name: "HD", width: 1920, height: 1080 },
  ];

  return (
    <>
      {/* Schema.org Structured Data */}
      <Script id="image-resizer-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Image Resizer",
          description:
            "Free online image resizer tool to resize images to any dimension. Resize JPEG, PNG, WebP images with custom dimensions or presets.",
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/image-resizer`,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: [
            "Custom dimension resizing",
            "Aspect ratio preservation",
            "Social media presets",
            "Batch processing",
            "High quality output",
          ],
        })}
      </Script>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Layout: Sidebar on Right */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-screen">
        {/* Main Content */}
        <main className="flex-1 lg:w-3/4 space-y-6">
          {/* Page Header (NOT Sticky) */}
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center gap-2 text-2xl">
                <ImageIcon className="w-6 h-6 text-blue-400" />
                Image Resizer
                <Badge className="bg-blue-400/20 text-blue-600 dark:text-blue-400">Popular</Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Resize images to any dimension while maintaining quality. Perfect for social media, web, and print.
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
                      if (e.key === "Enter" || e.key === " ") triggerFileInput();
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
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden">
                      <img
                        src={originalPreview}
                        alt="Original"
                        className="w-full h-48 object-contain bg-black/5"
                      />
                      <Badge className="absolute top-2 left-2 bg-blue-500/20 text-blue-300">
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
                        <span className="text-muted-foreground">Dimensions:</span>
                        <span className="text-foreground font-medium">
                          {originalDimensions.width} × {originalDimensions.height}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resize Settings */}
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Resize Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {originalFile && (
                  <>
                    {/* Preset Sizes */}
                    <div className="space-y-2">
                      <Label htmlFor="presets" className="text-foreground">
                        Quick Presets
                      </Label>
                      <div id="presets" className="grid grid-cols-2 gap-2">
                        {presetSizes.map((preset) => (
                          <Button
                            key={preset.name}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setTargetWidth(preset.width);
                              setTargetHeight(preset.height);
                            }}
                            className="text-xs"
                          >
                            {preset.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Dimensions */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-foreground">Custom Dimensions</Label>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={maintainAspectRatio}
                            onCheckedChange={setMaintainAspectRatio}
                            id="aspect-ratio-switch"
                          />
                          <Label htmlFor="aspect-ratio-switch" className="text-sm text-muted-foreground">
                            Lock aspect ratio
                          </Label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="width-input" className="text-foreground">
                            Width (px)
                          </Label>
                          <Input
                            id="width-input"
                            type="number"
                            value={targetWidth}
                            onChange={(e) => handleWidthChange(Number(e.target.value) || 0)}
                            className="bg-card/50 border-border text-foreground"
                            min="1"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="height-input" className="text-foreground">
                            Height (px)
                          </Label>
                          <Input
                            id="height-input"
                            type="number"
                            value={targetHeight}
                            onChange={(e) => handleHeightChange(Number(e.target.value) || 0)}
                            className="bg-card/50 border-border text-foreground"
                            min="1"
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={resizeImage}
                      disabled={isResizing || targetWidth <= 0 || targetHeight <= 0}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold"
                    >
                      {isResizing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Resizing...
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-4 h-4 mr-2" />
                          Resize Image
                        </>
                      )}
                    </Button>

                    {isResizing && <Progress value={progress} className="h-2" />}

                    {resizedFile && (
                      <div className="space-y-4">
                        <div className="relative rounded-lg overflow-hidden">
                          <img
                            src={resizedPreview}
                            alt="Resized"
                            className="w-full h-48 object-contain bg-black/5"
                          />
                          <Badge className="absolute top-2 left-2 bg-green-500/20 text-green-300">
                            Resized
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">New Size:</span>
                            <span className="text-foreground font-medium">
                              {formatFileSize(resizedFile.size)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Dimensions:</span>
                            <span className="text-foreground font-medium">
                              {targetWidth} × {targetHeight}
                            </span>
                          </div>
                        </div>

                        <Button
                          onClick={downloadResized}
                          className="w-full bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Resized
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
                    <Info className="w-5 h-5 text-blue-400" />
                    How to Resize Images
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
                      title: "Choose Dimensions",
                      description: "Use presets for social media or enter custom width and height",
                    },
                    {
                      step: 3,
                      title: "Set Options",
                      description: "Toggle aspect ratio lock to maintain proportions",
                    },
                    {
                      step: 4,
                      title: "Resize & Download",
                      description: "Click resize and download your perfectly sized image",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
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
                        title: "Social Media Presets",
                        description: "Quick resize for Instagram, Facebook, Twitter, and YouTube",
                      },
                      {
                        icon: Maximize2,
                        title: "Custom Dimensions",
                        description: "Set any width and height for your specific needs",
                      },
                      {
                        icon: CheckCircle,
                        title: "Aspect Ratio Lock",
                        description: "Maintain proportions to prevent image distortion",
                      },
                      {
                        icon: ImageIcon,
                        title: "High Quality",
                        description: "Advanced algorithms preserve image quality during resize",
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
                      <h4 className="font-semibold text-foreground mb-1">Social Media Optimization</h4>
                      <p className="text-sm text-muted-foreground">
                        Use our presets for perfect social media dimensions. Each platform has specific requirements for
                        optimal display.
                      </p>
                    </div>
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Maintain Quality</h4>
                      <p className="text-sm text-muted-foreground">
                        When enlarging images, be aware that quality may decrease. For best results, start with
                        high-resolution originals.
                      </p>
                    </div>
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Batch Processing</h4>
                      <p className="text-sm text-muted-foreground">
                        Need to resize multiple images? Use the same settings for consistent results across your entire
                        project.
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
  );
}
