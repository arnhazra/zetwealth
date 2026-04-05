import { Card, CardContent } from "@/shared/components/ui/card"
import IconContainer from "../icon-container"
import * as Icons from "lucide-react"
import { Widget } from "@/shared/constants/types"

interface WidgetCardProps {
  widget: Widget
}

export default function WidgetCard({ widget }: WidgetCardProps) {
  const WidgetIcon = (Icons as any)[widget.icon] || Icons.HelpCircle

  return (
    <Card className="bg-background/2 backdrop-blur-sm border border-border rounded-3xl relative overflow-hidden hover:shadow-md hover:shadow-primary/20">
      <CardContent className="-mt-2 -mb-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-theme-300">{widget.title}</span>
          <IconContainer>
            <WidgetIcon className="h-4 w-4" />
          </IconContainer>
        </div>
        <div className="space-y-3">
          <p className="text-2xl font-bold text-white">{widget.value}</p>
          <p className="text-sm">{widget.additionalInfo}</p>
        </div>
      </CardContent>
    </Card>
  )
}
