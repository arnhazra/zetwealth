"use client"
import { ReactNode } from "react"

interface IconContainerProps {
  children: ReactNode
  ai?: boolean
}

const IconContainer = ({ ai, children }: IconContainerProps) => {
  if (ai) {
    return (
      <div className="p-2 text-white rounded-full ui-soft-gradient">
        {children}
      </div>
    )
  }

  return (
    <div className="p-2 bg-primary text-black rounded-full">{children}</div>
  )
}

export default IconContainer
