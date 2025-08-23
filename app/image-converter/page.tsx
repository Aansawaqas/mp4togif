"use client";

import type { ReactElement } from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  RefreshCw,
  Upload,
  Download,
  Info,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import Script from "next/script";
import ImageToolsSidebar from "@/components/image-tools-sidebar";

const supportedFormats = [
  { value: "jpeg", label: "JPEG", extension: ".jpg" },
  { value: "png", label: "PNG", extension: ".png" },
  { value: "webp", label: "WebP", extension: ".webp" },
  { value: "bmp", label: "BMP", extension: ".bmp" },
  { value: "gif", label: "GIF", extension: ".gif" },
];

export default function ImageConverter(): ReactElement {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [convertedFile, setConvertedFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string>("");
  const [convertedPreview, setConvertedPreview] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState("jpeg");
  const [quality, setQuality] = useState<number[]>([90]);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (originalPreview) URL.revokeObjectURL(originalPreview);
      if (convertedPreview) URL.revokeObjectURL(convertedPreview);
    };
  }, [originalPreview, convertedPreview]);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPEG, PNG, WebP, GIF, BMP).");
      return;
    }

    setError(null);
    setOriginalFile(file);
    const url = URL.createObjectURL(file);
    setOriginalPreview(url);
    setConvertedFile(null);
    setConvertedPreview("");
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

  const convertImage = async () => {
    if (!originalFile || !canvasRef.current) return;

    setIsConverting(true);
    setProgress(0);
    setError(null);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 95) {
              clearInterval(progressInterval);
              return 95;
            }
            return prev + 15;
          });
        }, 100);

        ctx.drawImage(img, 0, 0);

        const mimeType = `image/${outputFormat}`;
        const qualityValue = outputFormat === "jpeg" ? quality[0] / 100 : undefined;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              setError("Conversion failed: Could not generate blob.");
              setIsConverting(false);
              return;
            }

            const format = supportedFormats.find((f) => f.value === outputFormat);
            const fileName = originalFile.name.replace(/\.[^/.]+$/, "") + (format?.extension || ".jpg");

            const file = new File([blob], fileName, { type: mimeType });
            setConvertedFile(file);
            const url = URL.createObjectURL(blob);
            setConvertedPreview(url);
            setProgress(100);
            setIsConverting(false);
          },
          mimeType,
          qualityValue
        );
      };

      img.onerror = () => {
        setError("Failed to load image. The file may be corrupted or unsupported.");
        setIsConverting(false);
      };

      img.src = originalPreview;
    } catch (err) {
      console.error("Conversion error:", err);
      setError("An unexpected error occurred during conversion.");
      setIsConverting(false);
    }
  };

  const downloadConverted = () => {
    if (!convertedFile) return;

    const a = document.createElement("a");
    a.href = convertedPreview;
    a.download = convertedFile.name;
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

  const getOriginalFormat = () => {
    if (!originalFile) return "";
    const type = originalFile.type.split("/")[1]?.toUpperCase();
    return type || "Unknown";
  };

  const compressionRatio =
    originalFile && convertedFile
      ? Math.round((1 - convertedFile.size / originalFile.size) * 100)
      : 0;

  return (
    <>
      {/* Schema.org Structured Data */}
      <Script id="image-converter-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Image Converter",
          description:
            "Free online image converter tool to convert between different image formats. Convert JPEG, PNG, WebP, GIF, and more.",
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/image-converter`,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web Browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          featureList: [
            "Multiple format support",
            "Quality control",
            "Batch conversion",
            "Fast processing",
            "No file size limits",
            "Privacy-focused processing",
          ],
        })}
      </Script>

      {/* Hidden canvas for conversion */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Layout: Sidebar on Right */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-screen pt-6 lg:pt-0">
        {/* Main Content - Left */}
        <main className="flex-1 lg:w-3/4 space-y-6">
          {/* Offset to prevent header overlap */}
          <div id="top" className="h-16"></div>

          {/* Page Header */}
          <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 sticky top-0 z-10">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center gap-2 text-2xl">
                <RefreshCw className="w-6 h-6 text-green-400" />
                Image Converter
                <Badge className="bg-green-400/20 text-green-600 dark:text-green-400">New</Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Convert images between different formats including JPEG, PNG, WebP, GIF, and BMP with quality control.
              </p>
            </CardHeader>
          </Card>

          {/* Upload & Settings */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Upload className="w-5 h-5 text-green-400" />
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
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400/50 ${
                      isDragOver
                        ? "border-green-400 bg-green-400/10"
                        : "border-border hover:border-green-400/50"
                    }`}
                  >
                    <Upload className="w-12 h-12 text-muted-foreground/80 mx-auto mb-4" />
                    <p className="text-foreground text-lg mb-2">Drop your image here</p>
                    <p className="text-muted-foreground/80 mb-4">Supports JPEG, PNG, WebP, GIF, BMP</p>
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
                        {getOriginalFormat()}
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
                        <span className="text-foreground font-medium">{getOriginalFormat()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Settings & Result */}
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Conversion Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {originalFile && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="output-format" className="text-foreground">
                        Output Format
                      </Label>
                      <Select value={outputFormat} onValueChange={setOutputFormat}>
                        <SelectTrigger
                          id="output-format"
                          className="bg-card/50 border-border text-foreground"
                        >
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          {supportedFormats.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              {format.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {outputFormat === "jpeg" && (
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
                          className="[&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-green-500"
                        />
                        <p className="text-xs text-muted-foreground">
                          Higher quality = larger file size
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={convertImage}
                      disabled={isConverting}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
                    >
                      {isConverting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Convert to {outputFormat.toUpperCase()}
                        </>
                      )}
                    </Button>

                    {isConverting && <Progress value={progress} className="h-2" />}

                    {convertedFile && (
                      <div className="space-y-4">
                        <div className="relative rounded-lg overflow-hidden">
                          <img
                            src={convertedPreview}
                            alt="Converted"
                            className="w-full h-48 object-contain bg-black/5"
                          />
                          <Badge className="absolute top-2 left-2 bg-green-500/20 text-green-300">
                            {outputFormat.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">New Size:</span>
                            <span className="text-foreground font-medium">
                              {formatFileSize(convertedFile.size)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              {compressionRatio !== 0
                                ? compressionRatio > 0
                                  ? "Reduced:"
                                  : "Increased:"
                                : "Same:"}
                            </span>
                            <span
                              className={`font-medium ${
                                compressionRatio > 0
                                  ? "text-green-400"
                                  : compressionRatio < 0
                                  ? "text-orange-400"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {Math.abs(compressionRatio)}%
                            </span>
                          </div>
                        </div>

                        <Button
                          onClick={downloadConverted}
                          className="w-full bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download {outputFormat.toUpperCase()}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="howto" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="howto">How to Use</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="formats">Supported Formats</TabsTrigger>
            </TabsList>

            <TabsContent value="howto" className="mt-6">
              <Card className="bg-card/50 backdrop-blur-lg border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Info className="w-5 h-5 text-green-400" />
                    How to Convert Images
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
                      title: "Choose Output Format",
                      description: "Select the desired format from JPEG, PNG, WebP, GIF, or BMP",
                    },
                    {
                      step: 3,
                      title: "Adjust Quality",
                      description: "For JPEG output, adjust quality slider to balance size and quality",
                    },
                    {
                      step: 4,
                      title: "Convert & Download",
                      description: "Click convert and download your image in the new format",
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
                        title: "Multiple Formats",
                        description: "Convert between JPEG, PNG, WebP, GIF, and BMP formats",
                      },
                      {
                        icon: CheckCircle,
                        title: "Quality Control",
                        description: "Adjust compression quality for JPEG output",
                      },
                      {
                        icon: CheckCircle,
                        title: "Instant Processing",
                        description: "Fast conversion directly in your browser",
                      },
                      {
                        icon: CheckCircle,
                        title: "Privacy Focused",
                        description: "All processing happens locally - no uploads to servers",
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

            <TabsContent value="formats" className="mt-6">
              <Card className="bg-card/50 backdrop-blur-lg border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Supported Formats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      {
                        format: "JPEG",
                        description: "Best for photos with many colors. Supports quality adjustment.",
                        useCase: "Photography, web images",
                      },
                      {
                        format: "PNG",
                        description: "Lossless compression with transparency support.",
                        useCase: "Graphics, logos, screenshots",
                      },
                      {
                        format: "WebP",
                        description: "Modern format with excellent compression and quality.",
                        useCase: "Web optimization, modern browsers",
                      },
                      {
                        format: "GIF",
                        description: "Supports animation and transparency with limited colors.",
                        useCase: "Simple graphics, animations",
                      },
                      {
                        format: "BMP",
                        description: "Uncompressed format with high quality.",
                        useCase: "Windows applications, archival",
                      },
                    ].map((fmt, index) => (
                      <div key={index} className="p-4 bg-card/30 rounded-lg">
                        <h3 className="font-semibold text-foreground mb-2">{fmt.format}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{fmt.description}</p>
                        <p className="text-xs text-muted-foreground/80">Best for: {fmt.useCase}</p>
                      </div>
                    ))}
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
  );
}
