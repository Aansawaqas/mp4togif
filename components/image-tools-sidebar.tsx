"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ImageIcon,
  Zap,
  Crop,
  RotateCcw,
  Droplets,
  RefreshCw,
  Sparkles,
  Layers,
  Palette,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const imageTools = [
  {
    name: "Image Compressor",
    href: "/image-compressor",
    icon: Zap,
    description: "Reduce file size without losing quality",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    popular: true,
    ready: true,
  },
  {
    name: "Image Resizer",
    href: "/image-resizer",
    icon: ImageIcon,
    description: "Resize images to any dimension",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    popular: true,
    ready: true,
  },
  {
    name: "Image Converter",
    href: "/image-converter",
    icon: RefreshCw,
    description: "Convert between different formats",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    popular: false,
    ready: true,
  },
  {
    name: "Image Cropper",
    href: "/image-cropper",
    icon: Crop,
    description: "Crop images to perfect dimensions",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    popular: false,
    ready: true,
  },
  {
    name: "Image Rotator",
    href: "/image-rotator",
    icon: RotateCcw,
    description: "Rotate images to any angle",
    color: "text-pink-400",
    bgColor: "bg-pink-400/10",
    popular: false,
    ready: true,
  },
  {
    name: "Image Watermarker",
    href: "/image-watermarker",
    icon: Droplets,
    description: "Add watermarks to protect images",
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    popular: false,
    ready: true,
  },
  {
    name: "Background Remover",
    href: "/background-remover",
    icon: Layers,
    description: "Remove backgrounds instantly",
    color: "text-indigo-400",
    bgColor: "bg-indigo-400/10",
    popular: false,
    ready: true,
  },
  {
    name: "Color Palette",
    href: "/color-palette",
    icon: Palette,
    description: "Extract colors from images",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    popular: false,
    ready: true,
  },
]

export default function ImageToolsSidebar() {
  const pathname = usePathname()
  const readyTools = imageTools.filter((tool) => tool.ready)
  const totalTools = imageTools.length
  const completionPercentage = (readyTools.length / totalTools) * 100

  return (
    <Card className="bg-card/50 backdrop-blur-lg border-border sticky top-32 z-10">
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Image Tools
          </h2>
          <p className="text-xs text-muted-foreground">Professional editing in your browser</p>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-foreground">Tools Ready</span>
            <span className="text-xs text-muted-foreground">
              {readyTools.length}/{totalTools}
            </span>
          </div>
          <Progress value={completionPercentage} className="h-1.5" />
        </div>

        {/* Available Tools */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Available Now
          </h3>
          <div className="space-y-1">
            {readyTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-200 group ${
                  pathname === tool.href
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-secondary/50"
                }`}
              >
                <div
                  className={`w-8 h-8 ${tool.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <tool.icon className={`w-4 h-4 ${tool.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span
                      className={`font-medium text-xs ${
                        pathname === tool.href ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {tool.name}
                    </span>
                    {tool.popular && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5"
                      >
                        Popular
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                    {tool.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            Coming Soon
          </h3>
          {imageTools.filter((tool) => !tool.ready).length > 0 ? (
            <div className="space-y-1">
              {imageTools
                .filter((tool) => !tool.ready)
                .slice(0, 3)
                .map((tool) => (
                  <div
                    key={tool.href}
                    className="flex items-center gap-2 p-2 rounded-lg opacity-60 cursor-not-allowed"
                  >
                    <div className={`w-8 h-8 ${tool.bgColor} rounded-lg flex items-center justify-center`}>
                      <tool.icon className={`w-4 h-4 ${tool.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-xs text-foreground">{tool.name}</span>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground italic">All tools are ready!</p>
          )}
        </div>

        {/* Quick Stats */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-xs font-semibold text-foreground mb-2">Quick Stats</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Tools</span>
              <span className="text-foreground font-medium">{totalTools}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Processing</span>
              <span className="text-green-400 font-medium">Client-side</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Privacy</span>
              <span className="text-green-400 font-medium">100% Secure</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">File Limit</span>
              <span className="text-blue-400 font-medium">50MB</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
