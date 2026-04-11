"use client"
import { Card, CardContent } from "@/shared/components/ui/card"
import IconContainer from "../icon-container"
import * as Icons from "lucide-react"
import { Widget } from "@/shared/constants/types"
import { useEffect, useRef, useState } from "react"

interface WidgetCardProps {
  widget: Widget
}

function useScrambleValue(target: string, duration = 1500, triggered: boolean) {
  const [displayed, setDisplayed] = useState(target)

  useEffect(() => {
    if (!triggered) return

    const startTime = performance.now()
    let rafId: number

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)

      if (progress >= 1) {
        setDisplayed(target)
        return
      }

      const scrambled = target
        .split("")
        .map((char, i) => {
          if (!/\d/.test(char)) return char
          const charProgress = progress * target.length - i
          if (charProgress >= 1) return char
          return String(Math.floor(Math.random() * 10))
        })
        .join("")

      setDisplayed(scrambled)
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [target, duration, triggered])

  return displayed
}

export default function WidgetCard({ widget }: WidgetCardProps) {
  const WidgetIcon = (Icons as any)[widget.icon] || Icons.HelpCircle
  const cardRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const animatedValue = useScrambleValue(widget.value, 1500, visible)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Card
      ref={cardRef}
      className="bg-background/2 backdrop-blur-sm border border-border rounded-3xl relative overflow-hidden hover:shadow-md hover:shadow-primary/20"
    >
      <CardContent className="-mt-2 -mb-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-theme-300">{widget.title}</span>
          <IconContainer>
            <WidgetIcon className="h-4 w-4" />
          </IconContainer>
        </div>
        <div className="space-y-3">
          <p className="text-2xl font-bold text-white">{animatedValue}</p>
          <p className="text-sm">{widget.additionalInfo}</p>
        </div>
      </CardContent>
    </Card>
  )
}
