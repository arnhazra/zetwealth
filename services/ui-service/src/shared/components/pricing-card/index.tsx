import * as Icons from "lucide-react"
import { Plan } from "@/shared/constants/types"
import { Button } from "../ui/button"
import Link from "next/link"
import IconContainer from "../icon-container"

interface PricingCardProps {
  plan: Plan
}

export function PricingCard({ plan }: PricingCardProps) {
  const isPro = plan.name.toLowerCase() === "pro"
  const Icon = (Icons as any)[plan.icon] || Icons.HelpCircle

  return (
    <div className="bg-background border border-border p-8 rounded-3xl flex flex-col">
      <div className="mb-6">
        <div className="w-fit mb-4">
          <IconContainer>
            <Icon className="h-6 w-6" />
          </IconContainer>
        </div>
        <h2 className="text-3xl font-medium">{plan.name}</h2>
        <p className="text-xl font-bold mt-4">
          ${plan.price}
          <span className="text-sm font-normal text-muted-foreground">
            /year
          </span>
        </p>
      </div>
      <Button
        variant={isPro ? "default" : "outline"}
        className={`w-full rounded-2xl mb-6 ${isPro ? "text-black" : ""}`}
        asChild
      >
        <Link href="/dashboard">Get Started</Link>
      </Button>
      <ul className="text-sm leading-relaxed space-y-3">
        {plan.features.map((feature) => (
          <li className="flex items-start gap-2" key={feature}>
            <Icons.Check className="h-4 w-4 shrink-0 mt-0.5" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}
