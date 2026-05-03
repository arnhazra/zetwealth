"use client"
import { ReactNode } from "react"

interface IconContainerProps {
  children: ReactNode
}

const IconContainer = ({ children }: IconContainerProps) => {
  return <div className="p-2 bg-primary rounded-full text-main">{children}</div>
}

export default IconContainer
