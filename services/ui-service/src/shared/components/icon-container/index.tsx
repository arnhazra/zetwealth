"use client"
import { ReactNode } from "react"

interface IconContainerProps {
  children: ReactNode
  ai?: boolean
}

const IconContainer = ({ ai, children }: IconContainerProps) => {
  if (ai) {
    return (
      <div className="w-10 h-10 grid place-items-center text-white hexagon-shape ui-soft-gradient">
        {children}
      </div>
    )
  }

  return (
    <div className="w-10 h-10 grid place-items-center bg-primary text-black hexagon-shape">
      {children}
    </div>
  )
}

export default IconContainer
