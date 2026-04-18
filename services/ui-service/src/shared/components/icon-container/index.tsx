"use client"
import { ReactNode } from "react"

interface IconContainerProps {
  children: ReactNode
  ai?: boolean
}

const IconContainer = ({ ai, children }: IconContainerProps) => {
  return (
    <div
      className={`p-2 bg-primary rounded-full ${ai ? "ui-soft-gradient text-white" : "text-black"}`}
    >
      {children}
    </div>
  )
}

export default IconContainer
