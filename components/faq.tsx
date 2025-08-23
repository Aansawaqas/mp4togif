"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const faqs = [
  {
    question: "Is this tool really free to use?",
    answer:
      "Yes! Our MP4 to GIF converter is completely free with no hidden costs, subscriptions, or usage limits. We believe in providing accessible tools for everyone.",
  },
  {
    question: "Are my files uploaded to your servers?",
    answer:
      "No, absolutely not! All conversion happens locally in your browser using WebAssembly. Your files never leave your device, ensuring complete privacy and security.",
  },
  {
    question: "What file formats do you support?",
    answer:
      "We support all major video formats including MP4, MOV, AVI, WebM, and more. The output is always a high-quality GIF file.",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "There are no artificial limits imposed by us. The only limitation is your device's available memory. Most modern devices can handle files up to several GB.",
  },
  {
    question: "Can I customize the GIF quality and settings?",
    answer:
      "You can adjust frame rate, dimensions, quality, and even trim specific portions of your video. We provide both basic and advanced settings for all skill levels.",
  },
  {
    question: "How long does the conversion take?",
    answer:
      "Conversion speed depends on your device's processing power and the video length. Most conversions complete within seconds to a few minutes.",
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="w-8 h-8 text-purple-400" />
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Frequently Asked Questions</h2>
          </div>
          <p className="text-muted-foreground text-lg">Everything you need to know about our converter</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className="bg-card/50 backdrop-blur-lg border-border hover:bg-card/70 transition-all duration-300"
            >
              <CardContent className="p-0">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-card/30 transition-colors"
                >
                  <h3 className="font-semibold text-foreground pr-4">{faq.question}</h3>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  )}
                </button>

                {openIndex === index && (
                  <div className="px-6 pb-6 pt-0">
                    <div className="border-t border-border pt-4">
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
