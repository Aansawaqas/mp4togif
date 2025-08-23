"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, Play, Pause, Download, Settings, Scissors, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import HeroSection from "@/components/hero-section"
import DemoPreview from "@/components/demo-preview"
import Features from "@/components/features"
import Testimonials from "@/components/testimonials"
import Comparison from "@/components/comparison"
import FAQ from "@/components/faq"

interface ConversionSettings {
  width: number
  height: number
  fps: number
  quality: number
  startTime: number
  endTime: number
  duration: number
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [gifUrl, setGifUrl] = useState<string>("")
  const [videoDuration, setVideoDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [ffmpeg, setFfmpeg] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [settings, setSettings] = useState<ConversionSettings>({
    width: 480,
    height: 270,
    fps: 15,
    quality: 80,
    startTime: 0,
    endTime: 5,
    duration: 5,
  })

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Load FFmpeg
  useEffect(() => {
    const loadFFmpeg = async () => {
      setIsLoading(true)
      try {
        const { FFmpeg } = await import("@ffmpeg/ffmpeg")
        const { fetchFile, toBlobURL } = await import("@ffmpeg/util")

        const ffmpegInstance = new FFmpeg()

        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd"
        await ffmpegInstance.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        })

        setFfmpeg(ffmpegInstance)
      } catch (error) {
        console.error("Failed to load FFmpeg:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFFmpeg()
  }, [])

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (selectedFile && selectedFile.type.startsWith("video/")) {
      setFile(selectedFile)
      const url = URL.createObjectURL(selectedFile)
      setVideoUrl(url)
      setGifUrl("")
      setProgress(0)
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

  const handleVideoLoad = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration
      setVideoDuration(duration)
      setSettings((prev) => ({
        ...prev,
        endTime: Math.min(duration, 5),
        duration: Math.min(duration, 5),
      }))
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const convertToGif = async () => {
    if (!file || !ffmpeg) return

    setIsConverting(true)
    setProgress(0)

    try {
      const { fetchFile } = await import("@ffmpeg/util")

      await ffmpeg.writeFile("input.mp4", await fetchFile(file))

      ffmpeg.on("progress", ({ progress }: { progress: number }) => {
        setProgress(Math.round(progress * 100))
      })

      const duration = settings.endTime - settings.startTime
      const command = [
        "-i",
        "input.mp4",
        "-ss",
        settings.startTime.toString(),
        "-t",
        duration.toString(),
        "-vf",
        `fps=${settings.fps},scale=${settings.width}:${settings.height}:flags=lanczos`,
        "-loop",
        "0",
        "output.gif",
      ]

      await ffmpeg.exec(command)

      const data = await ffmpeg.readFile("output.gif")
      const gifBlob = new Blob([data], { type: "image/gif" })
      const gifUrl = URL.createObjectURL(gifBlob)

      setGifUrl(gifUrl)
      setProgress(100)
    } catch (error) {
      console.error("Conversion failed:", error)
    } finally {
      setIsConverting(false)
    }
  }

  const downloadGif = () => {
    if (gifUrl) {
      const a = document.createElement("a")
      a.href = gifUrl
      a.download = "converted.gif"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-20">
        <Card className="w-96 p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-yellow-500 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold mb-2">Loading Converter...</h2>
          <p className="text-muted-foreground">Initializing video processing engine</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Demo Preview */}
      <DemoPreview />

      {/* Converter Section */}
      <section id="converter" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Start Converting Now</h2>
            <p className="text-muted-foreground text-lg">Upload your video and customize your GIF settings</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Upload Section */}
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-400" />
                  Upload Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!file ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                      isDragOver ? "border-yellow-400 bg-yellow-400/10" : "border-border hover:border-purple-400/50"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 text-muted-foreground/80 mx-auto mb-4" />
                    <p className="text-foreground text-lg mb-2">Drop your MP4 file here</p>
                    <p className="text-muted-foreground/80 mb-4">or click to browse</p>
                    <Button variant="outline" className="bg-white/10 border-white/30 text-foreground hover:bg-white/20">
                      Choose File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden bg-black">
                      <video
                        ref={videoRef}
                        src={videoUrl}
                        className="w-full h-32 sm:h-48 object-contain"
                        onLoadedMetadata={handleVideoLoad}
                        onTimeUpdate={handleTimeUpdate}
                      />
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="flex items-center gap-1 sm:gap-2 bg-black/50 rounded p-1 sm:p-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={togglePlayPause}
                            className="text-foreground hover:bg-white/20 h-8 w-8 p-0"
                          >
                            {isPlaying ? (
                              <Pause className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
                            ) : (
                              <Play className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                            )}
                          </Button>
                          <div className="flex-1">
                            <Slider
                              value={[currentTime]}
                              max={videoDuration}
                              step={0.1}
                              onValueChange={([value]) => seekTo(value)}
                              className="[&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-white [&_[role=slider]]:border-white"
                            />
                          </div>
                          <span className="text-foreground text-xs sm:text-sm">
                            {formatTime(currentTime)} / {formatTime(videoDuration)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                        {file.name}
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Settings Section */}
            <Card className="bg-card/50 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  Conversion Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/10">
                    <TabsTrigger value="basic" className="text-foreground data-[state=active]:bg-white/20">
                      Basic
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="text-foreground data-[state=active]:bg-white/20">
                      Advanced
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Quality: {settings.quality}%</Label>
                      <Slider
                        value={[settings.quality]}
                        onValueChange={([value]) => setSettings((prev) => ({ ...prev, quality: value }))}
                        max={100}
                        min={10}
                        step={10}
                        className="[&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-purple-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Frame Rate: {settings.fps} FPS</Label>
                      <Slider
                        value={[settings.fps]}
                        onValueChange={([value]) => setSettings((prev) => ({ ...prev, fps: value }))}
                        max={30}
                        min={5}
                        step={1}
                        className="[&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-pink-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label className="text-foreground">Width</Label>
                        <Input
                          type="number"
                          value={settings.width}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, width: Number.parseInt(e.target.value) || 480 }))
                          }
                          className="bg-card/50 border-border text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Height</Label>
                        <Input
                          type="number"
                          value={settings.height}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, height: Number.parseInt(e.target.value) || 270 }))
                          }
                          className="bg-card/50 border-border text-foreground"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-foreground flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-red-400" />
                        Trim Video
                      </Label>
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <span className="text-foreground text-sm w-full sm:w-12">Start:</span>
                          <Slider
                            value={[settings.startTime]}
                            onValueChange={([value]) => {
                              const newStart = Math.min(value, settings.endTime - 0.5)
                              setSettings((prev) => ({
                                ...prev,
                                startTime: newStart,
                                duration: prev.endTime - newStart,
                              }))
                            }}
                            max={videoDuration}
                            min={0}
                            step={0.1}
                            className="flex-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-green-500"
                          />
                          <span className="text-foreground text-sm w-full sm:w-12">
                            {formatTime(settings.startTime)}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <span className="text-foreground text-sm w-full sm:w-12">End:</span>
                          <Slider
                            value={[settings.endTime]}
                            onValueChange={([value]) => {
                              const newEnd = Math.max(value, settings.startTime + 0.5)
                              setSettings((prev) => ({
                                ...prev,
                                endTime: newEnd,
                                duration: newEnd - prev.startTime,
                              }))
                            }}
                            max={videoDuration}
                            min={0}
                            step={0.1}
                            className="flex-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-red-500"
                          />
                          <span className="text-foreground text-sm w-full sm:w-12">{formatTime(settings.endTime)}</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground/80 text-sm">Duration: {formatTime(settings.duration)}</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Section */}
          <Card className="mt-6 bg-card/50 backdrop-blur-lg border-border">
            <CardContent className="p-6">
              {!isConverting && !gifUrl && (
                <div className="text-center">
                  <Button
                    onClick={convertToGif}
                    disabled={!file || !ffmpeg}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-foreground font-bold px-6 sm:px-8 py-3 w-full sm:w-auto"
                  >
                    <Sparkles className="w-5 h-5 mr-2 text-yellow-300" />
                    Convert to GIF
                  </Button>
                </div>
              )}

              {isConverting && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-foreground text-lg font-semibold mb-2">Converting your video...</h3>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span className="text-foreground">{progress}%</span>
                    </div>
                  </div>
                  <Progress value={progress} className="h-3 bg-white/20" />
                </div>
              )}

              {gifUrl && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-foreground text-lg font-semibold mb-4">🎉 Conversion Complete!</h3>
                    <div className="bg-black/20 rounded-lg p-4 inline-block">
                      <img
                        src={gifUrl || "/placeholder.svg"}
                        alt="Converted GIF"
                        className="max-w-full h-auto rounded"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button
                      onClick={downloadGif}
                      className="bg-green-500 hover:bg-green-600 text-foreground font-bold w-full sm:w-auto"
                    >
                      <Download className="w-4 h-4 mr-2 text-white" />
                      Download GIF
                    </Button>
                    <Button
                      onClick={() => {
                        setFile(null)
                        setVideoUrl("")
                        setGifUrl("")
                        setProgress(0)
                      }}
                      variant="outline"
                      className="bg-white/10 border-white/30 text-foreground hover:bg-white/20 w-full sm:w-auto"
                    >
                      Convert Another
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* Testimonials */}
      <Testimonials />

      {/* Comparison */}
      <Comparison />

      {/* FAQ */}
      <FAQ />
    </div>
  )
}
