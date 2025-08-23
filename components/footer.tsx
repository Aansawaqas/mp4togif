"use client"

import Link from "next/link"
import { Film, Heart, Github, Twitter, Mail } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { name: "Home", href: "/" },
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
    social: [
      { name: "GitHub", href: "#", icon: Github, color: "text-gray-400" },
      { name: "Twitter", href: "#", icon: Twitter, color: "text-blue-400" },
      { name: "Email", href: "mailto:contact@mp4togif.com", icon: Mail, color: "text-green-400" },
    ],
  }

  return (
    <footer className="bg-card/50 backdrop-blur-lg border-t border-border mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-foreground mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Film className="w-5 h-5 text-foreground" />
              </div>
              <span className="font-bold text-xl">GIF Converter</span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-md">
              The fastest and most reliable MP4 to GIF converter. Transform your videos into high-quality animated GIFs
              with professional features.
            </p>
            <div className="flex items-center gap-4">
              {footerLinks.social.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className={`${social.color} hover:scale-110 transition-transform`}
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-muted-foreground/80 text-sm">© {currentYear} GIF Converter. All rights reserved.</p>
          <p className="text-muted-foreground/80 text-sm flex items-center gap-1 mt-2 md:mt-0">
            Made with <Heart className="w-4 h-4 text-red-400" /> for creators worldwide
          </p>
        </div>
      </div>
    </footer>
  )
}
