import { Check, Wallet } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { endPoints } from "@/shared/constants/api-endpoints"
import { PLATFORM_NAME } from "@/shared/constants/config"
import { useUserContext } from "@/context/user.provider"
import notify from "@/shared/hooks/use-notify"
import { useEffect, useState } from "react"
import IconContainer from "../icon-container"
import { useRouter } from "nextjs-toploader/app"
import api from "@/shared/lib/ky-api"
import { usePlatformConfig } from "@/context/platformconfig.provider"
import { DialogDescription } from "@radix-ui/react-dialog"

export function SubscriptionModal() {
  const [{ subscription }] = useUserContext()
  const router = useRouter()
  const { platformConfig } = usePlatformConfig()

  useEffect(() => {
    if (!subscription?.isActive) {
      router.push("/dashboard")
    }
  }, [subscription])

  const activateSubscription = async () => {
    try {
      const response: any = await api
        .post(endPoints.createCheckoutSession)
        .json()
      window.location = response.redirectUrl
    } catch (error) {
      notify(platformConfig?.otherConstants.subscriptionFailed, "error")
    }
  }

  return (
    <Dialog
      open={!subscription || !subscription?.isActive}
      onOpenChange={() => undefined}
    >
      <DialogOverlay className="bg-black/40 backdrop-blur-sm" />
      <DialogContent className="max-w-[25rem] sm:max-w-[25rem] bg-background/60 backdrop-blur-md border-border text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <IconContainer>
              <Wallet className="h-4 w-4" />
            </IconContainer>
            {PLATFORM_NAME} Subscription
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            You need to subscribe to contiue
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <p className="text-3xl font-bold text-primary">
            ${platformConfig?.subscriptionConfig.price}
            <span className="text-sm font-normal ml-1">/year</span>
          </p>
          <ul className="grid gap-2 text-sm text-muted-foreground">
            {platformConfig?.subscriptionConfig.features.map((feature) => (
              <li className="flex items-center" key={feature}>
                <Check className="mr-2 h-4 w-4 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            className="bg-primary hover:bg-primary focus:outline-none focus-visible:outline-none text-black"
            onClick={() => activateSubscription()}
          >
            Activate Subscription
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
