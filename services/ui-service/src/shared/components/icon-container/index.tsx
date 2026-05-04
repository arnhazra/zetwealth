"use client"
import { ReactNode } from "react"

interface IconContainerProps {
  children: ReactNode
}

const IconContainer = ({ children }: IconContainerProps) => {
  return (
    <div className="p-2 bg-primary rounded-full text-white">{children}</div>
  )
}

export default IconContainer
