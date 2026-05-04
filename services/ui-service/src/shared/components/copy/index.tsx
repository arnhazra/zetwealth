"use client"
import { useState } from "react"
import { Button } from "../ui/button"
import { CheckCircle2, Clipboard } from "lucide-react"
import Show from "../show"

export default function CopyToClipboard({ value }: { value: string }) {
  const [isCopied, setCopied] = useState(false)

  const copyValue = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 3000)
  }

  return (
    <Button
      variant="default"
      size="icon"
      onClick={copyValue}
      title="Copy to Clipboard"
      className="bg-primary hover:bg-primary"
    >
      <Show
        condition={!isCopied}
        fallback={<CheckCircle2 className="h-4 w-4" />}
      >
        <Clipboard className="h-4 w-4" />
      </Show>
    </Button>
  )
}
