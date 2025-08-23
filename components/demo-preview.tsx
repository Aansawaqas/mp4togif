"use client"

import { useState } from "react"
import { Play, Pause, RotateCcw, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function DemoPreview() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsPlaying(false)
            return 100
          }
          return prev + 2
        })
      }, 50)
    }
  }

  const handleReset = () => {
    setProgress(0)
    setIsPlaying(false)
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">See It In Action</h2>
          <p className="text-muted-foreground text-lg">Watch how easy it is to convert your videos to GIFs</p>
        </div>

        <Card className="bg-card/50 backdrop-blur-lg border-border overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2">
              {/* Video Preview */}
              <div className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  Original MP4
                </h3>
                <div className="aspect-video bg-black/20 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />
                  <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-white/80 text-sm">Sample Video</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  1920x1080 • 30fps • 5.2MB
                </div>
              </div>

              {/* GIF Preview */}
              <div className="p-6 bg-gradient-to-br from-pink-500/10 to-orange-500/10">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  Converted GIF
                </h3>
                <div className="aspect-video bg-black/20 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-orange-400/20" />
                  <div className="relative z-10 text-center">
                    {progress === 100 ? (
                      <>
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-2 mx-auto animate-bounce">
                          <Download className="w-8 h-8 text-green-400" />
                        </div>
                        <p className="text-green-400 text-sm font-semibold">Ready to Download!</p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                          {isPlaying ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                          ) : (
                            <Play className="w-8 h-8 text-white" />
                          )}
                        </div>
                        <p className="text-white/80 text-sm">{isPlaying ? "Converting..." : "Click to Convert"}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-pink-400 rounded-full" />
                  480x270 • 15fps • 1.8MB
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="p-6 border-t border-border bg-card/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handlePlay}
                    disabled={progress === 100}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {progress === 100 ? "Complete" : isPlaying ? "Converting" : "Start Demo"}
                  </Button>

                  <Button variant="outline" onClick={handleReset} size="sm">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">{progress}% Complete</div>
              </div>

              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
