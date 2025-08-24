"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Film,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  ImageIcon,
  Crop,
  Palette,
  RotateCcw,
  Zap,
  Layers,
  FilePlus,
  FileX,
  Merge,
  Split,
  FileImage,
  Type,
  Ligature as Signature,
  Droplets,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  const imageTools = [
    {
      category: "Basic Editing",
      tools: [
        {
          name: "Image Resizer",
          href: "/image-resizer",
          icon: ImageIcon,
          description: "Resize images to any dimension",
        },
        { name: "Image Cropper", href: "/image-cropper", icon: Crop, description: "Crop images to perfect size" },
        {
          name: "Image Rotator",
          href: "/image-rotator",
          icon: RotateCcw,
          description: "Rotate images any angle",
        },
        {
          name: "Image Compressor",
          href: "/image-compressor",
          icon: Zap,
          description: "Reduce file size without quality loss",
        },
      ],
    },
    {
      category: "Advanced Tools",
      tools: [
        {
          name: "Image Watermarker",
          href: "/image-watermarker",
          icon: Droplets,
          description: "Add watermarks to protect images",
        },
        {
          name: "Image Converter",
          href: "/image-converter",
          icon: RefreshCw,
          description: "Convert between different formats",
        },
        {
          name: "Background Remover",
          href: "/background-remover",
          icon: Layers,
          description: "Remove backgrounds instantly",
        },
        { name: "Color Palette", href: "/color-palette", icon: Palette, description: "Extract colors from images" },
      ],
    },
  ]

  const pdfTools = [
    {
      category: "PDF Creation",
      tools: [
        { name: "Create PDF", href: "/create-pdf", icon: FilePlus, description: "Create PDFs from images/text" },
        { name: "Image to PDF", href: "/image-to-pdf", icon: FileImage, description: "Convert images to PDF" },
        { name: "Text to PDF", href: "/text-to-pdf", icon: Type, description: "Convert text documents to PDF" },
        { name: "Sign PDF", href: "/sign-pdf", icon: Signature, description: "Add digital signatures" },
      ],
    },
    {
      category: "PDF Editing",
      tools: [
        { name: "Merge PDFs", href: "/pdf-merger", icon: Merge, description: "Combine multiple PDFs" },
        { name: "Split PDF", href: "/pdf-splitter", icon: Split, description: "Split PDF into pages" },
        { name: "Compress PDF", href: "/pdf-compressor", icon: Zap, description: "Reduce PDF file size" },
        { name: "Delete Pages", href: "/delete-pdf-pages", icon: FileX, description: "Remove unwanted pages" },
      ],
    },
  ]

  const handleDropdownToggle = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  const closeDropdowns = () => {
    setActiveDropdown(null)
  }

  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4">
      <nav className="bg-card/80 dark:bg-card/80 backdrop-blur-lg rounded-full border border-border px-6 py-3 relative">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:block">GIF Converter</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-foreground hover:text-primary transition-colors ${
                  pathname === item.href ? "text-primary" : ""
                }`}
                onClick={closeDropdowns}
              >
                {item.name}
              </Link>
            ))}

            {/* Image Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => handleDropdownToggle("image")}
                className="flex items-center gap-1 text-foreground hover:text-primary transition-colors"
              >
                Image Tools
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${activeDropdown === "image" ? "rotate-180" : ""}`}
                />
              </button>

              {activeDropdown === "image" && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[600px] bg-card/95 backdrop-blur-lg border border-border rounded-2xl shadow-2xl p-6">
                  <div className="grid grid-cols-2 gap-6">
                    {imageTools.map((category, categoryIndex) => (
                      <div key={categoryIndex}>
                        <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">
                          {category.category}
                        </h3>
                        <div className="space-y-2">
                          {category.tools.map((tool, toolIndex) => (
                            <Link
                              key={toolIndex}
                              href={tool.href}
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                              onClick={closeDropdowns}
                            >
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <tool.icon className="w-5 h-5 text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                                  {tool.name}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{tool.description}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-border">
                    <Link
                      href="/image-tools"
                      className="text-sm text-primary hover:text-primary/80 font-medium"
                      onClick={closeDropdowns}
                    >
                      View all image tools →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* PDF Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => handleDropdownToggle("pdf")}
                className="flex items-center gap-1 text-foreground hover:text-primary transition-colors"
              >
                PDF Tools
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${activeDropdown === "pdf" ? "rotate-180" : ""}`}
                />
              </button>

              {activeDropdown === "pdf" && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[600px] bg-card/95 backdrop-blur-lg border border-border rounded-2xl shadow-2xl p-6">
                  <div className="grid grid-cols-2 gap-6">
                    {pdfTools.map((category, categoryIndex) => (
                      <div key={categoryIndex}>
                        <h3 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">
                          {category.category}
                        </h3>
                        <div className="space-y-2">
                          {category.tools.map((tool, toolIndex) => (
                            <Link
                              key={toolIndex}
                              href={tool.href}
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                              onClick={closeDropdowns}
                            >
                              <div className="w-10 h-10 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <tool.icon className="w-5 h-5 text-red-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                                  {tool.name}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{tool.description}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-border">
                    <Link
                      href="/tools/pdf"
                      className="text-sm text-primary hover:text-primary/80 font-medium"
                      onClick={closeDropdowns}
                    >
                      View all PDF tools →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Theme Toggle & Mobile Menu */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-foreground hover:bg-secondary rounded-full w-10 h-10 p-0"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-blue-400" />
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-foreground hover:bg-secondary rounded-full w-10 h-10 p-0"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-lg border border-border rounded-2xl p-6">
            <div className="space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block text-foreground hover:text-primary transition-colors py-2 ${
                    pathname === item.href ? "text-primary" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Image Tools */}
              <div className="border-t border-border pt-4">
                <h3 className="font-semibold text-foreground mb-3">Image Tools</h3>
                <div className="grid grid-cols-1 gap-2">
                  {imageTools
                    .flatMap((category) => category.tools)
                    .slice(0, 4)
                    .map((tool, index) => (
                      <Link
                        key={index}
                        href={tool.href}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <tool.icon className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-foreground">{tool.name}</span>
                      </Link>
                    ))}
                </div>
              </div>

              {/* Mobile PDF Tools */}
              <div className="border-t border-border pt-4">
                <h3 className="font-semibold text-foreground mb-3">PDF Tools</h3>
                <div className="grid grid-cols-1 gap-2">
                  {pdfTools
                    .flatMap((category) => category.tools)
                    .slice(0, 4)
                    .map((tool, index) => (
                      <Link
                        key={index}
                        href={tool.href}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <tool.icon className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-foreground">{tool.name}</span>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Backdrop for closing dropdowns */}
        {activeDropdown && <div className="fixed inset-0 -z-10" onClick={closeDropdowns} />}
      </nav>
    </header>
  )
}
