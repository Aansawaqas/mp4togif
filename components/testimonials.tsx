"use client"

import { useState, useEffect } from "react"
import { Star, Quote } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Content Creator",
    avatar: "/placeholder.svg?height=40&width=40&text=SC",
    content:
      "This tool saved me hours of work! The quality is amazing and it's so easy to use. Perfect for creating social media content.",
    rating: 5,
  },
  {
    name: "Mike Rodriguez",
    role: "Marketing Manager",
    avatar: "/placeholder.svg?height=40&width=40&text=MR",
    content:
      "We use this daily for our marketing campaigns. Fast, reliable, and the output quality is consistently excellent.",
    rating: 5,
  },
  {
    name: "Emily Johnson",
    role: "Video Editor",
    avatar: "/placeholder.svg?height=40&width=40&text=EJ",
    content:
      "As a professional editor, I'm impressed by the quality. It handles large files effortlessly and the trimming feature is perfect.",
    rating: 5,
  },
  {
    name: "David Park",
    role: "Developer",
    avatar: "/placeholder.svg?height=40&width=40&text=DP",
    content:
      "Love that it works entirely in the browser. No privacy concerns and lightning fast. Exactly what I needed for my projects.",
    rating: 5,
  },
]

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Loved by Creators Worldwide</h2>
          <p className="text-muted-foreground text-lg">Join thousands of satisfied users who trust our converter</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className={`bg-card/50 backdrop-blur-lg border-border transition-all duration-500 transform hover:scale-105 ${
                index === currentIndex ? "ring-2 ring-purple-500/50 scale-105" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <Quote className="w-8 h-8 text-purple-400/50 mb-3" />

                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{testimonial.content}</p>

                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-sm">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{testimonial.name}</div>
                    <div className="text-muted-foreground text-xs">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-purple-500 w-8" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
