"use client";

import type { ReactElement } from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Crop,
  Upload,
  Download,
  Info,
  CheckCircle,
  RotateCcw,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Script from "next/script";
import ImageToolsSidebar from "@/components/image-tools-sidebar";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
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
];

export default function ImageCropper(): ReactElement {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string>("");
  const [croppedPreview, setCroppedPreview] = useState<string>("");
  const [cropArea, setCropArea] = useState<CropArea>({ x: 50, y: 50, width: 200, height: 200 });
  const [aspectRatio, setAspectRatio] = useState<string>("free");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (originalPreview) URL.revokeObjectURL(originalPreview);
      if (croppedPreview) URL.revokeObjectURL(croppedPreview);
    };
  }, [originalPreview, croppedPreview]);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPEG, PNG, WebP).");
      return;
    }

    setError(null);
    setOriginalFile(file);
    const url = URL.createObjectURL(file);
    setOriginalPreview(url);
    setCroppedFile(null);
    setCroppedPreview("");
    setProgress(0);

    // Get image dimensions
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img;
      setImageSize({ width: naturalWidth, height: naturalHeight });

      // Center crop area (50% of image)
      setCropArea({
        x: naturalWidth * 0.25,
        y: naturalHeight * 0.25,
        width: naturalWidth * 0.5,
        height: naturalHeight * 0.5,
      });
    };
    img.onerror = () => {
      setError("Failed to load image. The file may be corrupted.");
    };
    img.src = url;
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

  const handleCropAreaChange = (field: keyof CropArea, value: number) => {
    setCropArea((prev) => {
      let newValue = Math.max(0, value);

      // Clamp values within image bounds
      if (field === "x" && newValue + prev.width > imageSize.width) {
        newValue = imageSize.width - prev.width;
      }
      if (field === "y" && newValue + prev.height > imageSize.height) {
        newValue = imageSize.height - prev.height;
      }
      if (field === "width" && newValue > imageSize.width - prev.x) {
        newValue = imageSize.width - prev.x;
      }
      if (field === "height" && newValue > imageSize.height - prev.y) {
        newValue = imageSize.height - prev.y;
      }

      return { ...prev, [field]: newValue };
    });
  };

  const handleAspectRatioChange = (ratio: string) => {
    setAspectRatio(ratio);

    if (ratio !== "free") {
      const [widthRatio, heightRatio] = ratio.split(":").map(Number);
      const aspectValue = widthRatio / heightRatio;

      setCropArea((prev) => {
        const newHeight = Math.min(prev.width / aspectValue, imageSize.height - prev.y);
        return { ...prev, height: newHeight };
      });
    }
  };

  const cropImage = async () => {
    if (!originalFile || !canvasRef.current || !imageRef.current) return;

    setIsCropping(true);
    setProgress(0);
    setError(null);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

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

      // Set canvas to crop dimensions
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;

      // Draw cropped region
      ctx.drawImage(
        imageRef.current,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Cropping failed: Could not generate image data.");
            setIsCropping(false);
            return;
          }

          const fileName = originalFile.name.replace(/\.[^/.]+$/, "") + "_cropped.jpg";
          const file = new File([blob], fileName, { type: "image/jpeg" });
          setCroppedFile(file);
          const url = URL.createObjectURL(blob);
          setCroppedPreview(url);
          setProgress(100);
          setIsCropping(false);
        },
        "image/jpeg",
        0.9
      );
    } catch (err) {
      console.error("Crop failed:", err);
      setError("An unexpected error occurred during cropping.");
      setIsCropping(false);
    }
  };

  const downloadCropped = () => {
    if (!croppedFile) return;

    const a = document.createElement("a");
    a.href = croppedPreview;
    a.download = croppedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetCrop = () => {
    if (imageSize.width && imageSize.height) {
      setCropArea({
        x: imageSize.width * 0.25,
        y: imageSize.height * 0.25,
        width: imageSize.width * 0.5,
        height: imageSize.height * 0.5,
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
      {/* Schema.org Structured Data */}
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

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Layout: Sidebar on Right */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-screen pt-6 lg:pt-0">
        {/* Main Content */}
        <main className="flex-1 lg:w-3/4 space-y-6">
          {/* Offset to prevent header overlap */}
          <div id="top" className="h-16"></div>

          {/* Page Header */}
          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 sticky top-0 z-10">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground flex items-center gap-2 text-2xl">
                <Crop className="w-6 h-6 text-purple-400" />
                Image Cropper
                <Badge className="bg-purple-400/20 text-purple-600 dark:text-purple-400">New</Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Crop images to perfect dimensions with precision tools and aspect ratio presets.
              </p>
            </CardHeader>
          </Card>

          {/* Upload & Settings Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upload & Preview */}
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Upload className="w-5 h-5 text-purple-400" />
                  Upload & Crop
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
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400/50 ${
                      isDragOver
                        ? "border-purple-400 bg-purple-400/10"
                        : "border-border hover:border-purple-400/50"
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
                    <div className="relative rounded-lg overflow-hidden bg-black/5">
                      <img
                        ref={imageRef}
                        src={originalPreview}
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
                        <span className="text-foreground font-medium">
                          {formatFileSize(originalFile.size)}
                        </span>
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

            {/* Crop Settings */}
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Crop Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {originalFile && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="aspect-ratio" className="text-foreground">
                        Aspect Ratio
                      </Label>
                      <Select value={aspectRatio} onValueChange={handleAspectRatioChange}>
                        <SelectTrigger id="aspect-ratio" className="bg-card/50 border-border text-foreground">
                          <SelectValue placeholder="Select ratio" />
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
                        <Label htmlFor="crop-x" className="text-foreground">
                          X Position
                        </Label>
                        <Input
                          id="crop-x"
                          type="number"
                          value={Math.round(cropArea.x)}
                          onChange={(e) => handleCropAreaChange("x", Number(e.target.value))}
                          className="bg-card/50 border-border text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="crop-y" className="text-foreground">
                          Y Position
                        </Label>
                        <Input
                          id="crop-y"
                          type="number"
                          value={Math.round(cropArea.y)}
                          onChange={(e) => handleCropAreaChange("y", Number(e.target.value))}
                          className="bg-card/50 border-border text-foreground"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="crop-width" className="text-foreground">
                          Width
                        </Label>
                        <Input
                          id="crop-width"
                          type="number"
                          value={Math.round(cropArea.width)}
                          onChange={(e) => handleCropAreaChange("width", Number(e.target.value))}
                          className="bg-card/50 border-border text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="crop-height" className="text-foreground">
                          Height
                        </Label>
                        <Input
                          id="crop-height"
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
                        aria-label="Reset crop"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>

                    {isCropping && <Progress value={progress} className="h-2" />}

                    {croppedFile && (
                      <div className="space-y-4">
                        <div className="relative rounded-lg overflow-hidden">
                          <img
                            src={croppedPreview}
                            alt="Cropped"
                            className="w-full h-48 object-contain bg-black/5"
                          />
                          <Badge className="absolute top-2 left-2 bg-green-500/20 text-green-300">
                            Cropped
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">New Size:</span>
                            <span className="text-foreground font-medium">
                              {formatFileSize(croppedFile.size)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Dimensions:</span>
                            <span className="text-foreground font-medium">
                              {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
                            </span>
                          </div>
                        </div>

                        <Button
                          onClick={downloadCropped}
                          className="w-full bg-green-500 hover:bg-green-600 text-white"
                        >
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
