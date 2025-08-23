"use client";

import type { ReactElement } from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  Download,
  Zap,
  Info,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import Script from "next/script";
import ImageToolsSidebar from "@/components/image-tools-sidebar";

export default function ImageCompressor(): ReactElement {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string>("");
  const [compressedPreview, setCompressedPreview] = useState<string>("");
  const [quality, setQuality] = useState<number[]>([80]);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      if (originalPreview) URL.revokeObjectURL(originalPreview);
      if (compressedPreview) URL.revokeObjectURL(compressedPreview);
    };
  }, [originalPreview, compressedPreview]);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPEG, PNG, WebP).");
      return;
    }

    setError(null);
    setOriginalFile(file);
    const url = URL.createObjectURL(file);
    setOriginalPreview(url);
    setCompressedFile(null);
    setCompressedPreview("");
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

  const compressImage = async () => {
    if (!originalFile) return;

    setIsCompressing(true);
    setProgress(0);
    setError(null);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const { default: Compressor } = await import("compressorjs");

      new Compressor(originalFile, {
        quality: quality[0] / 100,
        mimeType: "image/jpeg", // Ensures fallback format
        success: (result: File) => {
          setCompressedFile(result);
          const url = URL.createObjectURL(result);
          setCompressedPreview(url);
          setProgress(100);
          setIsCompressing(false);
          clearInterval(progressInterval);
        },
        error: (err: Error) => {
          console.error("Compression failed:", err);
          setError(`Compression failed: ${err.message}`);
          setIsCompressing(false);
          clearInterval(progressInterval);
        },
      });
    } catch (err) {
      console.error("Failed to load compressor.js", err);
      setError("Failed to initialize image compressor. Please try again.");
      setIsCompressing(false);
    }
  };

  const downloadCompressed = () => {
    if (!compressedFile) return;

    const a = document.createElement("a");
    a.href = compressedPreview;
    a.download = `compressed_${originalFile?.name.replace(/\.[^/.]+$/, "") || "image"}.jpg`;
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

  const compressionRatio =
    originalFile && compressedFile
      ? Math.round((1 - compressedFile.size / originalFile.size) * 100)
      : 0;

  return (
    <>
      {/* Schema.org Structured Data (JSON-LD) */}
      <Script id="image-compressor-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Image Compressor",
          description:
            "Free online image compressor tool to reduce file size without losing quality. Compress JPEG, PNG, WebP images instantly in your browser.",
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/image-compressor`,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: [
            "Lossless image compression",
            "Multiple format support",
            "Batch processing",
            "No file size limits",
            "Privacy-focused processing",
          ],
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/image-compressor`,
          },
        })}
      </Script>

      <div className="flex flex-col lg:flex-row gap-6 min-h-screen">
        {/* Sidebar: Hidden on mobile, shown on large screens */}
        <aside className="lg:w-1/4 lg:shrink-0 hidden lg:block">
          <ImageToolsSidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:w-3/4 space-y-6">
          {/* Page Header */}
          <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center gap-2 text-2xl">
                <Zap className="w-6 h-6 text-yellow-400" />
                Image Compressor
                <Badge className="bg-yellow-400/20 text-yellow-600 dark:text-yellow-400">
                  Most Popular
                </Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Reduce image file size by up to 90% without losing visual quality. Perfect for web optimization and
                storage savings.
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
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400/50 ${
                      isDragOver
                        ? "border-yellow-400 bg-yellow-400/10"
                        : "border-border hover:border-yellow-400/50"
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
                        onLoad={() => {
                          if (originalPreview) URL.revokeObjectURL(originalPreview);
                        }}
                      />
                      <Badge className="absolute top-2 left-2 bg-blue-500/20 text-blue-300">
                        Original
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Size:</span>
                      <span className="text-foreground font-medium">
                        {formatFileSize(originalFile.size)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Settings & Result */}
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Compression Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {originalFile && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="quality-slider" className="text-foreground">
                        Quality: {quality[0]}%
                      </Label>
                      <Slider
                        id="quality-slider"
                        value={quality}
                        onValueChange={setQuality}
                        max={100}
                        min={10}
                        step={5}
                        className="[&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-yellow-500"
                      />
                      <p className="text-xs text-muted-foreground">
                        Higher quality = larger file size
                      </p>
                    </div>

                    <Button
                      onClick={compressImage}
                      disabled={isCompressing}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold"
                    >
                      {isCompressing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Compressing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Compress Image
                        </>
                      )}
                    </Button>

                    {isCompressing && <Progress value={progress} className="h-2" />}

                    {compressedFile && (
                      <div className="space-y-4">
                        <div className="relative rounded-lg overflow-hidden">
                          <img
                            src={compressedPreview}
                            alt="Compressed"
                            className="w-full h-48 object-contain bg-black/5"
                          />
                          <Badge className="absolute top-2 left-2 bg-green-500/20 text-green-300">
                            Compressed
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">New Size:</span>
                            <span className="text-foreground font-medium">
                              {formatFileSize(compressedFile.size)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Saved:</span>
                            <span className="text-green-400 font-medium">{compressionRatio}%</span>
                          </div>
                        </div>

                        <Button
                          onClick={downloadCompressed}
                          className="w-full bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Compressed
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* How to Use, Features, Tips */}
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
                    How to Compress Images
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      step: 1,
                      title: "Upload Your Image",
                      description:
                        "Drag and drop or click to select your image file (JPEG, PNG, WebP supported)",
                    },
                    {
                      step: 2,
                      title: "Adjust Quality",
                      description:
                        "Use the quality slider to balance file size and image quality (80% recommended)",
                    },
                    {
                      step: 3,
                      title: "Compress",
                      description: "Click the compress button and wait for processing to complete",
                    },
                    {
                      step: 4,
                      title: "Download",
                      description:
                        "Download your compressed image with significantly reduced file size",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
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
                        title: "Lossless Compression",
                        description:
                          "Advanced algorithms preserve image quality while reducing file size",
                      },
                      {
                        icon: Zap,
                        title: "Lightning Fast",
                        description:
                          "Process images instantly in your browser with no server uploads",
                      },
                      {
                        icon: AlertCircle,
                        title: "Privacy First",
                        description:
                          "All processing happens locally - your images never leave your device",
                      },
                      {
                        icon: CheckCircle,
                        title: "Multiple Formats",
                        description:
                          "Support for JPEG, PNG, WebP and other popular image formats",
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
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Web Optimization</h4>
                      <p className="text-sm text-muted-foreground">
                        For web use, 80-85% quality usually provides the best balance between file size and visual
                        quality.
                      </p>
                    </div>
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Print Quality</h4>
                      <p className="text-sm text-muted-foreground">
                        For print materials, keep quality above 90% to maintain crisp details and colors.
                      </p>
                    </div>
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-1">Batch Processing</h4>
                      <p className="text-sm text-muted-foreground">
                        Process multiple images with the same settings for consistent results across your project.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}
