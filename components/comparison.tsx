"use client"

import { Check, X, Zap, Shield, Download, Settings, Clock, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const features = [
  { name: "Processing Speed", us: "Lightning Fast", others: "Slow", icon: Zap },
  { name: "File Privacy", us: "100% Local", others: "Uploaded to Servers", icon: Shield },
  { name: "File Size Limit", us: "No Limits", others: "Limited", icon: Download },
  { name: "Custom Settings", us: "Full Control", others: "Basic Options", icon: Settings },
  { name: "Wait Time", us: "Instant", others: "Queue System", icon: Clock },
  { name: "Cost", us: "Free Forever", others: "Subscription Required", icon: CreditCard },
]

export default function Comparison() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-foreground border-green-500/30">
            Why Choose Us?
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Better Than The Rest</h2>
          <p className="text-muted-foreground text-lg">See how we compare to other conversion tools</p>
        </div>

        <Card className="bg-card/50 backdrop-blur-lg border-border overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div></div>
              <div>
                <CardTitle className="text-foreground flex items-center justify-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  Our Tool
                </CardTitle>
              </div>
              <div>
                <CardTitle className="text-muted-foreground">Other Tools</CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`grid grid-cols-3 gap-4 p-4 items-center ${
                  index % 2 === 0 ? "bg-card/30" : "bg-transparent"
                } hover:bg-card/50 transition-colors`}
              >
                <div className="flex items-center gap-3 text-foreground font-medium">
                  <feature.icon className="w-5 h-5 text-purple-400" />
                  {feature.name}
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-green-400 font-semibold">
                    <Check className="w-4 h-4" />
                    {feature.us}
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-red-400">
                    <X className="w-4 h-4" />
                    {feature.others}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
