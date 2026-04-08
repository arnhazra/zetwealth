import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import {
  Article,
  Asset,
  Cashflow,
  Debt,
  Goal,
  AssetGroup,
  Thread,
} from "@/shared/constants/types"
import {
  Banknote,
  BadgePercent,
  CreditCard,
  ExternalLink,
  GoalIcon,
  HistoryIcon,
  Layers2,
  Newspaper,
  OctagonAlert,
  Plus,
  Workflow,
} from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/shared/lib/format-currency"
import { useUserContext } from "@/context/user.provider"
import Show from "../show"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import IconContainer from "../icon-container"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/shared/components/ui/button"
import { useEffect, useState } from "react"
import { formatDate } from "@/shared/lib/date-formatter"
import { ResourceDetails } from "../resource-details"
import { ResourceTypeForDetailModal } from "../resource-details/data"
import { createResourceUrlMap, ResourceTypeMap, ResourceType } from "./data"
import { uiConstants } from "@/shared/constants/global-constants"
import { useRouter } from "nextjs-toploader/app"
import MaskText from "../mask"

const resourceIconMap = {
  [ResourceType.ASSET]: <Banknote className="h-4 w-4" />,
  [ResourceType.ASSETGROUP]: <Layers2 className="h-4 w-4" />,
  [ResourceType.DEBT]: <CreditCard className="h-4 w-4" />,
  [ResourceType.GOAL]: <GoalIcon className="h-4 w-4" />,
  [ResourceType.NEWS]: <Newspaper className="h-4 w-4" />,
  [ResourceType.CASHFLOW]: <Workflow className="h-4 w-4" />,
  [ResourceType.THREAD]: <BadgePercent className="h-4 w-4" />,
}

type ResourceCardProps<T extends keyof ResourceTypeMap> = {
  resourceType: T
  resource: ResourceTypeMap[T]
}

export function ResourceCard<T extends keyof ResourceTypeMap>({
  resourceType,
  resource,
}: ResourceCardProps<T>) {
  const [{ user }] = useUserContext()
  const router = useRouter()
  const [articleImageError, setArticleImageError] = useState(false)
  const [resourceDescription, setResourceDescription] = useState<string | null>(
    null
  )
  const [resourceBadgeText, setEnytityBadgeText] = useState("")
  const [enityTitle, setResourceTitle] = useState("")
  const [info, setInfo] = useState<{
    infoHeader: string
    infoValue: string
  }>({ infoHeader: "", infoValue: "" })

  const [valuation, setValuation] = useState<{
    valuationHeader: string
    valuationAmount: number | null | undefined | string
  }>({
    valuationHeader: "",
    valuationAmount: 0,
  })
  const [displayDate, setDisplayDate] = useState("")

  const handleArticleImageError = () => {
    setArticleImageError(true)
  }

  useEffect(() => {
    switch (resourceType) {
      case ResourceType.ASSETGROUP:
        setResourceTitle((resource as AssetGroup).assetgroupName)
        setInfo({
          infoHeader: "Assets",
          infoValue: (resource as AssetGroup).assetCount?.toString() || "0",
        })
        setValuation({
          valuationHeader: "Net Valuation",
          valuationAmount: (resource as AssetGroup).currentValuation,
        })
        const assetgroupCreatedAt = (resource as AssetGroup).createdAt
          ? formatDistanceToNow(
              new Date((resource as AssetGroup).createdAt ?? ""),
              {
                addSuffix: true,
              }
            )
          : null
        setDisplayDate(assetgroupCreatedAt ?? "")
        break
      case ResourceType.ASSET:
        setResourceTitle((resource as Asset).assetName)
        setInfo({
          infoHeader: "Identifier",
          infoValue: (resource as Asset).identifier,
        })
        setValuation({
          valuationHeader: "Current Valuation",
          valuationAmount: (resource as Asset).currentValuation,
        })
        const assetCreatedAt = (resource as Asset).createdAt
          ? formatDistanceToNow(new Date((resource as Asset).createdAt ?? ""), {
              addSuffix: true,
            })
          : null
        setDisplayDate(assetCreatedAt ?? "")
        break
      case ResourceType.DEBT:
        setResourceTitle((resource as Debt).debtPurpose)
        setInfo({
          infoHeader: "Next EMI Date",
          infoValue: formatDate((resource as Debt).nextEmiDate),
        })
        setValuation({
          valuationHeader: "EMI",
          valuationAmount: (resource as Debt).emi,
        })
        const debtCreatedAt = (resource as Debt).createdAt
          ? formatDistanceToNow(new Date((resource as Debt).createdAt ?? ""), {
              addSuffix: true,
            })
          : null
        setDisplayDate(debtCreatedAt ?? "")
        break
      case ResourceType.GOAL:
        setResourceTitle(formatDate((resource as Goal).goalDate, false))
        setInfo({
          infoHeader: "Goal Date",
          infoValue: formatDate((resource as Goal).goalDate, true),
        })
        setValuation({
          valuationHeader: "Goal",
          valuationAmount: (resource as Goal).goalAmount,
        })
        const goalCreatedAt = (resource as Goal).createdAt
          ? formatDistanceToNow(new Date((resource as Goal).createdAt ?? ""), {
              addSuffix: true,
            })
          : null
        setDisplayDate(goalCreatedAt ?? "")
        break
      case ResourceType.CASHFLOW:
        setResourceTitle((resource as Cashflow).description)
        setInfo({
          infoHeader: "Flow Direction",
          infoValue: (resource as Cashflow).flowDirection,
        })
        setValuation({
          valuationHeader: "Cashflow Amount",
          valuationAmount: (resource as Cashflow).amount,
        })
        const cashflowCreatedAt = (resource as Cashflow).createdAt
          ? formatDistanceToNow(
              new Date((resource as Cashflow).createdAt ?? ""),
              {
                addSuffix: true,
              }
            )
          : null
        setDisplayDate(cashflowCreatedAt ?? "")
        break
      case ResourceType.NEWS:
        setEnytityBadgeText((resource as Article).source?.name || "NEWS")
        setResourceTitle((resource as Article).title ?? "")
        setResourceDescription((resource as Article).description || null)
        const newsPublishedAt = (resource as Article).publishedAt
          ? formatDistanceToNow(
              new Date((resource as Article).publishedAt ?? ""),
              {
                addSuffix: true,
              }
            )
          : null
        setDisplayDate(newsPublishedAt ?? "")
        break
      case ResourceType.THREAD:
        setResourceTitle("Tax Advise")
        setInfo({
          infoHeader: "Thread ID",
          infoValue: (resource as Thread).threadId,
        })
        setValuation({
          valuationHeader: "Advise Date",
          valuationAmount: formatDate((resource as Thread).createdAt),
        })
        const threadCreatedAt = (resource as Thread).createdAt
          ? formatDistanceToNow(
              new Date((resource as Thread).createdAt ?? ""),
              {
                addSuffix: true,
              }
            )
          : null
        setDisplayDate(threadCreatedAt ?? "")
        break
      default:
        break
    }
  }, [resourceType, resource])

  if (resourceType === ResourceType.NEWS) {
    return (
      <Card className="w-full max-w-xs mx-auto h-[22rem] flex flex-col relative hover:shadow-md transition-shadow bg-background border-border text-white pt-0 overflow-hidden">
        <div className="relative aspect-video overflow-hidden bg-muted rounded-t-3xl">
          <Show
            condition={!!(resource as Article).urlToImage && !articleImageError}
            fallback={
              <img
                src={uiConstants.newsFallbackImageUrl}
                alt="News image"
                className="object-cover w-full h-full transition-transform duration-300 hover:scale-105 rounded-t-3xl"
              />
            }
          >
            <img
              src={
                (resource as Article).urlToImage ??
                uiConstants.newsFallbackImageUrl
              }
              alt={(resource as Article).title || "News image"}
              className="object-cover w-full h-full transition-transform duration-300 hover:scale-105 rounded-t-3xl"
              onError={handleArticleImageError}
            />
          </Show>
          <div className="absolute inset-0 bg-gradient-to-t from-background to-background/60" />
          <Badge className="absolute top-2 left-2 bg-primary/90 hover:bg-primary text-black">
            {resourceBadgeText}
          </Badge>
          <div className="absolute top-2 right-2">
            <IconContainer>{resourceIconMap[resourceType]}</IconContainer>
          </div>
        </div>
        <CardHeader className="flex-grow min-w-0">
          <div className="flex min-w-0">
            <CardTitle
              className="text-xl font-semibold text-white truncate"
              title={enityTitle}
            >
              {enityTitle}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm line-clamp-3 mt-2 text-theme-300">
            {resourceDescription || "No description available"}
          </p>
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              {displayDate && (
                <span className="flex gap-2">
                  <HistoryIcon className="h-3 w-3 mt-1" />
                  {displayDate}
                </span>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          {(resource as Article).url && (
            <Button
              variant="default"
              asChild
              className="w-full gap-2 bg-border hover:bg-border bg-theme-800 hover:bg-theme-800/90"
            >
              <Link
                href={(resource as Article).url ?? ""}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read full article
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    )
  }

  return (
    <ResourceDetails
      resourceType={resourceType as unknown as ResourceTypeForDetailModal}
      resource={resource as unknown as Asset | Debt | Goal | Cashflow}
    >
      <Card
        onClick={(): void => {
          if (resourceType === ResourceType.ASSETGROUP) {
            router.push(
              `/apps/assetmanager/assetgroup/${(resource as AssetGroup)._id}`
            )
          } else if (resourceType === ResourceType.THREAD) {
            router.push(
              `/apps/taxadvisor/thread?threadId=${(resource as Thread).threadId}`
            )
          }
        }}
        className="bg-background/2 border h-[11rem] backdrop-blur-sm border-border p-2 rounded-3xl hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
      >
        <CardHeader className="flex mt-5 items-start gap-2">
          <div className="flex min-w-0 flex-1 gap-2">
            <h2 className=" text-xl truncate break-all">{enityTitle}</h2>
            <div className="mt-1 shrink-0">
              <Show
                condition={
                  (resourceType === ResourceType.ASSET &&
                    (resource as Asset).isMatured) ||
                  (resourceType === ResourceType.DEBT &&
                    (resource as Debt).isMatured)
                }
              >
                <Tooltip>
                  <TooltipTrigger>
                    <OctagonAlert className="h-4 w-4 text-secondary" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-background text-white border-border">
                    This {resourceType} is matured
                  </TooltipContent>
                </Tooltip>
              </Show>
              <Show
                condition={
                  (resourceType === ResourceType.ASSET &&
                    (resource as Asset).isMaturityApproaching) ||
                  (resourceType === ResourceType.DEBT &&
                    (resource as Debt).isMaturityApproaching)
                }
              >
                <Tooltip>
                  <TooltipTrigger>
                    <OctagonAlert className="h-4 w-4 text-amber-400" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-background text-white border-border">
                    This {resourceType} is about to mature
                  </TooltipContent>
                </Tooltip>
              </Show>
            </div>
          </div>
          <div className="shrink-0">
            <IconContainer>{resourceIconMap[resourceType]}</IconContainer>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-theme-300">{info.infoHeader}</span>
              <span className="text-sm font-medium">
                <Show
                  condition={
                    resourceType === ResourceType.ASSET ||
                    resourceType === ResourceType.THREAD
                  }
                  fallback={info.infoValue}
                >
                  <MaskText value={info.infoValue} />
                </Show>
              </span>
            </div>
            <Show condition={!!valuation.valuationHeader}>
              <div className="flex justify-between items-center">
                <span className="text-sm text-theme-300">
                  {valuation.valuationHeader}
                </span>
                {typeof valuation.valuationAmount === "string" ? (
                  <span className="text-lg font-bold text-white">
                    {valuation.valuationAmount}
                  </span>
                ) : (
                  <span className="text-lg font-bold text-white">
                    {formatCurrency(
                      Number(valuation.valuationAmount) ?? 0,
                      user.baseCurrency
                    )}
                  </span>
                )}
              </div>
            </Show>
          </div>
        </CardContent>
      </Card>
    </ResourceDetails>
  )
}

export function AddResourceCard({
  resourceType,
}: {
  resourceType: ResourceType
}) {
  return (
    <Link href={createResourceUrlMap[resourceType] ?? ""}>
      <Card className="bg-background/2 flex flex-row h-[11rem] items-center justify-center backdrop-blur-sm border border-border rounded-3xl relative overflow-hidden hover:shadow-md hover:shadow-primary/20">
        <IconContainer>
          <Plus className="w-4 h-4" />
        </IconContainer>
        <p className="text-lg font-medium capitalize">Add {resourceType}</p>
      </Card>
    </Link>
  )
}
