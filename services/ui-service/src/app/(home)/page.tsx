"use client"
import { endPoints } from "@/shared/constants/api-endpoints"
import HTTPMethods from "@/shared/constants/http-methods"
import { AppsConfig, SolutionConfig } from "@/shared/constants/types"
import { uiConstants } from "@/shared/constants/global-constants"
import {
  BoxIcon,
  Check,
  Coins,
  Lightbulb,
  BookOpenIcon,
  Code2,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/shared/lib/utils"
import { Button, buttonVariants } from "@/shared/components/ui/button"
import Loading from "../loading"
import useQuery from "@/shared/hooks/use-query"
import { AppCard } from "@/shared/components/app-card"
import { useRouter } from "nextjs-toploader/app"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import HomePageHeader from "@/shared/components/homepage-header"
import { Badge } from "@/shared/components/ui/badge"
import { SolutionCard } from "@/shared/components/solution-card"
import IconContainer from "@/shared/components/icon-container"
import { PLATFORM_NAME } from "@/shared/constants/config"

export default function Page() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  const apps = useQuery<AppsConfig>({
    queryKey: ["app-config"],
    queryUrl: `${endPoints.getConfig}/app-config`,
    method: HTTPMethods.GET,
  })

  const solutions = useQuery<SolutionConfig>({
    queryKey: ["solution-config"],
    queryUrl: `${endPoints.getConfig}/solution-config`,
    method: HTTPMethods.GET,
  })

  const openSourceConfig = useQuery<any>({
    queryKey: ["open-source-config"],
    queryUrl: `${endPoints.getConfig}/open-source-config`,
    method: HTTPMethods.GET,
  })

  const renderHeroSection = (
    <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-28 hero-landing">
      <div className="mx-auto max-w-[85rem] px-4 sm:px-6 lg:px-8 text-left">
        <h1 className="text-white text-xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight mb-4 max-w-[40rem]">
          {uiConstants.homeHeader}
        </h1>
        <p className="max-w-[35rem] leading-normal text-theme-300 sm:text-lg sm:leading-8">
          {uiConstants.homeIntro}
        </p>
        <p className="max-w-[35rem] leading-normal text-primary sm:text-lg sm:leading-8 mb-6">
          {uiConstants.openSourceIntro}
        </p>
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({
              variant: "default",
              className:
                "bg-primary hover:bg-primary text-black rounded-full h-11 w-40",
            })
          )}
        >
          {uiConstants.getStartedButton}
          <ArrowRight className="ms-2 h-4 w-4" />
        </Link>
      </div>
    </section>
  )

  const renderAppsSection = (
    <section
      id="apps"
      className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8 space-y-6 py-8 md:py-12 lg:py-24 lg:rounded-3xl"
    >
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <Badge className="p-2 ps-4 pe-4 text-md bg-background text-primary border border-border rounded-full shadow-md shadow-primary/20">
          <BoxIcon className="h-4 w-4 me-2" />
          {apps?.data?.title}
        </Badge>
        <p className="max-w-[85%] leading-normal sm:text-lg sm:leading-7">
          {apps?.data?.description}
        </p>
      </div>
      <div className="mx-auto grid justify-center gap-4 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-4">
        {apps?.data?.apps?.map((app) => (
          <AppCard key={app.appName} app={app} />
        ))}
      </div>
    </section>
  )

  const renderSolutionsSection = (
    <div className="bg-geometric-pattern">
      <section
        id="solutions"
        className="mx-auto max-w-[85rem] px-4 sm:px-6 lg:px-8 space-y-6 py-8 md:py-12 lg:py-24 lg:rounded-3xl "
      >
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <Badge className="p-2 ps-4 pe-4 text-md bg-background text-primary border border-border rounded-full shadow-md shadow-primary/20">
            <Lightbulb className="h-4 w-4 me-2" />
            {solutions?.data?.title}
          </Badge>
          <p className="max-w-[85%] leading-normal sm:text-lg sm:leading-7">
            {solutions?.data?.desc}
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-1 md:max-w-[35rem] md:grid-cols-1 lg:max-w-[50rem] lg:grid-cols-2 xl:max-w-[68rem] xl:grid-cols-3">
          {solutions?.data?.solutions?.map((solution) => (
            <SolutionCard
              key={solution.displayName}
              solution={solution}
              ai={solution.displayName.includes("Intelligence")}
            />
          ))}
        </div>
      </section>
    </div>
  )

  const renderOpenSourceSection = (
    <section id="opensource" className="py-8 md:py-12 lg:py-24">
      <div className="mx-auto max-w-[50rem] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[64rem] flex-col items-center justify-center text-center mb-8">
          <Badge className="mb-4 p-2 ps-4 pe-4 text-md bg-background text-primary border border-border rounded-full shadow-md shadow-primary/20">
            <Coins className="h-4 w-4 me-2" />
            {openSourceConfig.data?.title}
          </Badge>

          <p className="max-w-[85%] leading-normal sm:text-lg sm:leading-7 mb-2">
            {openSourceConfig.data?.desc}
          </p>
        </div>
        <div className="bg-background border border-border p-8 rounded-3xl flex flex-col hover:shadow-lg hover:shadow-primary/20">
          <div className="flex justify-between items-center mb-12">
            <div>
              <p className="text-xl">{PLATFORM_NAME}</p>
              <h2 className="text-2xl">{openSourceConfig.data?.title}</h2>
            </div>
            <IconContainer>
              <BookOpenIcon className="h-4 w-4" />
            </IconContainer>
          </div>
          <p className="text-sm leading-relaxed mt-auto">
            {openSourceConfig.data?.features.map((feature: string) => {
              return (
                <li className="flex items-center mb-2" key={feature}>
                  <Check className="mr-2 h-4 w-4" /> {feature}
                </li>
              )
            })}
          </p>
          <div className="mt-8 flex justify-end">
            <Button variant="default" className="text-black" asChild>
              <a
                href={`https://github.com/arnhazra/${PLATFORM_NAME.toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Source Code
                <Code2 />
              </a>
            </Button>
          </div>
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
              © {new Date().getFullYear()} {PLATFORM_NAME}{" "}
              {uiConstants.copyrightText}
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
        {renderAppsSection}
        {renderSolutionsSection}
        {renderOpenSourceSection}
      </div>
      {renderFooterSection}
    </>
  )
}
