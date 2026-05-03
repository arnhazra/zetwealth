import * as Icons from "lucide-react"
import { Feature } from "@/shared/constants/types"
import IconContainer from "../icon-container"
import { Card, CardContent, CardHeader } from "../ui/card"

interface FeatureCardProps {
  feature: Feature
  ai?: boolean
}

export function FeatureCard({ feature, ai }: FeatureCardProps) {
  const FeatureIcon = (Icons as any)[feature.icon] || Icons.HelpCircle

  return (
    <Card className="bg-background border border-border p-2 rounded-3xl hover:shadow-lg hover:shadow-primary/10 cursor-pointer h-full flex flex-col">
      <CardHeader className="flex justify-between mt-6 items-center">
        <h2 className="text-2xl">{feature.displayName}</h2>
        <IconContainer>
          <FeatureIcon className="h-4 w-4" />
        </IconContainer>
      </CardHeader>
      <CardContent className="mb-6 mt-auto">
        <p className="text-sm leading-relaxed justify ">
          {feature.description}
        </p>
      </CardContent>
    </Card>
  )
}
