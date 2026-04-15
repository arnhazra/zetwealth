"use client"
import { usePlatformConfig } from "@/context/platformconfig.provider"
import Link from "next/link"
import { formatCurrency } from "@/shared/lib/format-currency"
import { Currency } from "country-code-enum"
import { Button } from "@/shared/components/ui/button"
import Loading from "../loading"
import { AppCard } from "@/shared/components/app-card"
import { useRouter } from "nextjs-toploader/app"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import HomePageHeader from "@/shared/components/homepage-header"
import { FeatureCard } from "@/shared/components/feature-card"
import { PricingCard } from "@/shared/components/pricing-card"
import WidgetCard from "@/shared/components/widget-card"
import { ScrollReveal } from "@/shared/components/scroll-reveal"

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
        <Button variant="default" className="text-black hover:text-black w-36">
          <Link href={platformConfig?.heroConfig.getStartedUrl ?? ""}>
            {platformConfig?.otherConstants.getStartedButton}
          </Link>
        </Button>
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
        {platformConfig?.featureConfig?.features?.map(
          (feature: any, index: number) => (
            <ScrollReveal
              key={feature.displayName}
              delay={index * 80}
              className="h-full"
            >
              <FeatureCard
                feature={feature}
                ai={feature.displayName.includes("Cowork")}
              />
            </ScrollReveal>
          )
        )}
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
        {platformConfig?.appConfig?.apps?.map((app, index: number) => (
          <ScrollReveal key={app.appName} delay={index * 80} className="h-full">
            <AppCard app={app} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  )

  const resolveWidgetPlaceholders = () => {
    const widgets = platformConfig?.widgetConfig?.widgets
    if (!widgets) return []

    const now = new Date()
    const monthYear = now.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    })

    const assetValue = (Math.floor(Math.random() * 900) + 100) * 1_000_000
    const expenseValue = (Math.floor(Math.random() * 9) + 1) * 1_00000
    const goalAmount = (Math.floor(Math.random() * 500) + 10) * 1_000_0000
    const remainingDebt = (Math.floor(Math.random() * 200) + 50) * 1_000
    const totalEmi = (Math.floor(Math.random() * 5) + 1) * 1_000

    const replacements: Record<string, string> = {
      ASSET_VALUE: formatCurrency(assetValue, Currency.USD),
      EXPENSE_VALUE: formatCurrency(expenseValue, Currency.USD),
      GOAL_AMOUNT: formatCurrency(goalAmount, Currency.USD),
      REMAINING_DEBT: formatCurrency(remainingDebt, Currency.USD),
      TOTAL_EMI: formatCurrency(totalEmi, Currency.USD),
      MONTH_YEAR: monthYear,
      GOAL_PERCENTAGE: String(
        assetValue / goalAmount > 1
          ? 100
          : Math.floor((assetValue / goalAmount) * 100)
      ),
    }

    const json = JSON.stringify(widgets)
    const resolved = json.replace(
      /\{([A-Z_]+)\}/g,
      (_, key) => replacements[key] ?? `{${key}}`
    )
    return JSON.parse(resolved)
  }

  const renderDynamicStatsSection = (
    <section
      id="dynamic-stats"
      className="mx-auto max-w-[85rem] px-4 sm:px-6 lg:px-8 space-y-6 py-8 md:py-12 lg:py-24"
    >
      <div className="mx-auto flex w-full max-w-[68rem] flex-col items-start space-y-4 text-left">
        <h1 className="font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-6 tracking-wide">
          {platformConfig?.widgetConfig?.title}
        </h1>
        <p className="max-w-[58rem] leading-normal sm:text-lg sm:leading-7">
          {platformConfig?.widgetConfig?.desc}
        </p>
      </div>
      <div className="mx-auto grid w-full max-w-[68rem] justify-start gap-4 sm:grid-cols-1 md:max-w-[35rem] md:grid-cols-1 lg:max-w-[50rem] lg:grid-cols-2 xl:max-w-[68rem] xl:grid-cols-4">
        {resolveWidgetPlaceholders().map((widget: any, index: number) => (
          <ScrollReveal key={widget.icon} delay={index * 80} className="h-full">
            <WidgetCard widget={widget} scramble />
          </ScrollReveal>
        ))}
      </div>
    </section>
  )

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
          <ScrollReveal delay={1500} className="h-full">
            <PricingCard plan={platformConfig?.subscriptionConfig} />
          </ScrollReveal>
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
        {renderDynamicStatsSection}
        {renderSubscriptionSection}
      </div>
      {renderFooterSection}
    </>
  )
}
