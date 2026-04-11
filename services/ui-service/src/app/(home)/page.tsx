"use client"
import { usePlatformConfig } from "@/context/platformconfig.provider"
import { ArrowRightCircle } from "lucide-react"
import * as Icons from "lucide-react"
import Link from "next/link"
import { cn } from "@/shared/lib/utils"
import { buttonVariants, Button } from "@/shared/components/ui/button"
import Loading from "../loading"
import { AppCard } from "@/shared/components/app-card"
import { useRouter } from "nextjs-toploader/app"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import HomePageHeader from "@/shared/components/homepage-header"
import { FeatureCard } from "@/shared/components/feature-card"
import { PricingCard } from "@/shared/components/pricing-card"

export default function Page() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const { platformConfig } = usePlatformConfig()

  const renderHeroSection = (
    <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-28 hero-landing">
      <div className="mx-auto max-w-[85rem] px-4 sm:px-6 lg:px-8 text-left">
        <h1 className="text-white text-xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight mb-4 max-w-[40rem]">
          {platformConfig?.heroConfig.title}
        </h1>
        <p className="max-w-[35rem] leading-normal text-theme-100 sm:text-lg sm:leading-8 mb-4">
          {platformConfig?.heroConfig.description}
        </p>
        <Link
          href={platformConfig?.heroConfig.getStartedUrl ?? ""}
          className={cn(
            buttonVariants({
              variant: "default",
              className:
                "bg-primary hover:bg-primary text-black rounded-2xl h-10 w-36",
            })
          )}
        >
          {platformConfig?.otherConstants.getStartedButton}
          <ArrowRightCircle className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )

  const renderFeaturesSection = (
    <section
      id="features"
      className="mx-auto max-w-[85rem] px-4 sm:px-6 lg:px-8 space-y-6 py-8 md:py-12 lg:py-24 lg:rounded-3xl"
    >
      <div className="mx-auto flex w-full max-w-[68rem] flex-col items-start space-y-4 text-left">
        <h1 className="font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-6 tracking-wide">
          {platformConfig?.featureConfig.title}
        </h1>
        <p className="max-w-[58rem] leading-normal sm:text-lg sm:leading-7">
          {platformConfig?.featureConfig?.desc}
        </p>
      </div>
      <div className="mx-auto grid w-full max-w-[68rem] justify-start gap-4 sm:grid-cols-1 md:max-w-[35rem] md:grid-cols-1 lg:max-w-[50rem] lg:grid-cols-2 xl:max-w-[68rem] xl:grid-cols-3">
        {platformConfig?.featureConfig?.features?.map((feature: any) => (
          <FeatureCard
            key={feature.displayName}
            feature={feature}
            ai={feature.displayName.includes("Cowork")}
          />
        ))}
      </div>
    </section>
  )

  const renderAppsSection = (
    <section
      id="apps"
      className="mx-auto max-w-[85rem] px-4 sm:px-6 lg:px-8 space-y-6 py-8 md:py-12 lg:py-24"
    >
      <div className="mx-auto flex w-full max-w-[68rem] flex-col items-start space-y-4 text-left">
        <h1 className="font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-6 tracking-wide">
          {platformConfig?.appConfig.title}
        </h1>
        <p className="max-w-[58rem] leading-normal sm:text-lg sm:leading-7">
          {platformConfig?.appConfig?.description}
        </p>
      </div>
      <div className="mx-auto grid w-full max-w-[68rem] justify-start gap-4 sm:grid-cols-1 md:max-w-[35rem] md:grid-cols-1 lg:max-w-[50rem] lg:grid-cols-2 xl:max-w-[68rem] xl:grid-cols-3">
        {platformConfig?.appConfig?.apps?.map((app) => (
          <AppCard key={app.appName} app={app} />
        ))}
      </div>
    </section>
  )

  const renderServiceTiersSection = () => {
    const config = platformConfig?.serviceTiersConfig
    const TierIcon = (Icons as any)[config?.icon ?? "Shapes"] ?? Icons.Shapes

    return (
      <section id="service-tiers" className="py-8 md:py-12 ">
        <div className="mx-auto max-w-[85rem] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid w-full max-w-[68rem] gap-10 rounded-[2rem] bg-background border border-border px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1.05fr_1fr] lg:px-12 lg:py-12">
            <div className="flex flex-col items-start justify-between">
              <div>
                <TierIcon
                  className="mb-8 h-12 w-12 text-theme-100"
                  strokeWidth={1.5}
                />
                <h2 className="mb-4 text-4xl font-semibold tracking-tight text-theme-100 sm:text-5xl">
                  {config?.title}
                </h2>
                <p className="max-w-[32rem] text-lg leading-8 text-theme-300">
                  {config?.description}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  variant="default"
                  className="rounded-2xl bg-theme-100 px-6 text-black hover:bg-theme-200"
                  asChild
                >
                  <Link href={config?.learnMoreUrl ?? ""}>
                    {config?.learnMoreText}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl border-theme-700 bg-theme-800 px-6 text-theme-100 hover:bg-theme-700 hover:text-white"
                  asChild
                >
                  <Link href={config?.contactUrl ?? ""}>
                    {config?.contactText}
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-8 lg:pl-6">
              {config?.tiers?.map((tier) => (
                <div key={tier.name}>
                  <h3 className="text-2xl font-semibold text-theme-100">
                    {tier.name}
                  </h3>
                  <p className="mt-2 text-lg leading-8 text-theme-400">
                    {tier.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  const renderSubscriptionSection = (
    <section id="pricing" className="py-8 md:py-12 lg:py-24">
      <div className="mx-auto max-w-[85rem] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[68rem] flex-col items-start justify-center text-left mb-8">
          <h1 className="font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-6 tracking-wide">
            {platformConfig?.subscriptionConfig?.title}
          </h1>
          <p className="max-w-[58rem] leading-normal sm:text-lg sm:leading-7 mb-2">
            {platformConfig?.subscriptionConfig?.desc}
          </p>
        </div>
        <div className="mx-auto grid w-full max-w-[68rem] justify-start gap-4 sm:grid-cols-1 md:max-w-[35rem] md:grid-cols-1 lg:max-w-[50rem] lg:grid-cols-2 xl:max-w-[68rem] xl:grid-cols-3">
          {platformConfig?.subscriptionConfig?.plans?.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  )

  const renderFooterSection = (
    <footer>
      <div className="text-white">
        <div className="mx-auto max-w-[85rem] px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2">
            <p className="text-center text-sm leading-loose md:text-left">
              {platformConfig?.otherConstants.copyrightText ?? ""}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )

  useEffect(() => {
    const accessToken = Cookies.get("accessToken")
    if (accessToken) {
      router.replace("/dashboard")
    } else {
      setChecked(true)
    }
  }, [router])

  if (!checked) return <Loading />

  return (
    <>
      <div className="min-h-screen w-full text-white">
        <HomePageHeader />
        {renderHeroSection}
        {renderFeaturesSection}
        {renderAppsSection}
        {renderServiceTiersSection()}
        {renderSubscriptionSection}
      </div>
      {renderFooterSection}
    </>
  )
}
