import { toast } from "sonner"
import { XCircle, Info, AlertTriangle, CircleCheck } from "lucide-react"
import { JSX } from "react"
import { quickSand } from "@/app/layout"

type ToastType = "success" | "error" | "info" | "warning"

const typeConfig: Record<ToastType, { icon: JSX.Element; color: string }> = {
  success: {
    icon: <CircleCheck className="text-primary h-4 w-4 me-4" />,
    color: "text-primary",
  },
  error: {
    icon: <XCircle className="text-red-500 h-4 w-4 me-4" />,
    color: "text-secondary",
  },
  info: {
    icon: <Info className="text-blue-500 h-4 w-4 me-4" />,
    color: "text-blue-400",
  },
  warning: {
    icon: <AlertTriangle className="text-yellow-500 h-4 w-4 me-4" />,
    color: "text-yellow-400",
  },
}

const useNotify = () => {
  return (message: string | undefined, type: ToastType = "info") => {
    const { icon, color } = typeConfig[type]

    toast(<p className="text-white">Notification</p>, {
      icon,
      className: `${quickSand.className} bg-background border-border`,
      description: <p className={color}>{message ?? ""}</p>,
    })
  }
}

const notify = useNotify()
export default notify
