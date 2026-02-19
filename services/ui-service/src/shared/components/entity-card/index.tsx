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
  Space,
} from "@/shared/constants/types"
import {
  Banknote,
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
import { EntityDetails } from "../entity-details"
import { EntityTypeForDetailModal } from "../entity-details/data"
import { createEntityUrlMap, EntityMap, EntityType } from "./data"
import EntitySummarizer from "../entity-summarizer"
import { uiConstants } from "@/shared/constants/global-constants"
import { useRouter } from "nextjs-toploader/app"
import MaskText from "../mask"

const entityIconMap = {
  [EntityType.ASSET]: <Banknote className="h-5 w-5" />,
  [EntityType.SPACE]: <Layers2 className="h-5 w-5" />,
  [EntityType.DEBT]: <CreditCard className="h-5 w-5" />,
  [EntityType.GOAL]: <GoalIcon className="h-5 w-5" />,
  [EntityType.NEWS]: <Newspaper className="h-5 w-5" />,
  [EntityType.CASHFLOW]: <Workflow className="h-5 w-5" />,
}

type EntityCardProps<T extends keyof EntityMap> = {
  entityType: T
  entity: EntityMap[T]
}

export function EntityCard<T extends keyof EntityMap>({
  entityType,
  entity,
}: EntityCardProps<T>) {
  const [{ user }] = useUserContext()
  const router = useRouter()
  const [articleImageError, setArticleImageError] = useState(false)
  const [entityDescription, setEntityDescription] = useState<string | null>(
    null
  )
  const [entityBadgeText, setEnytityBadgeText] = useState("")
  const [enityTitle, setEntityTitle] = useState("")
  const [info, setInfo] = useState<{
    infoHeader: string
    infoValue: string
  }>({ infoHeader: "", infoValue: "" })

  const [valuation, setValuation] = useState<{
    valuationHeader: string
    valuationAmount: number | null | undefined
  }>({
    valuationHeader: "",
    valuationAmount: 0,
  })
  const [displayDate, setDisplayDate] = useState("")

  const handleArticleImageError = () => {
    setArticleImageError(true)
  }

  useEffect(() => {
    switch (entityType) {
      case EntityType.SPACE:
        setEntityTitle((entity as Space).spaceName)
        setInfo({
          infoHeader: "Assets",
          infoValue: (entity as Space).assetCount?.toString() || "0",
        })
        setValuation({
          valuationHeader: "Net Valuation",
          valuationAmount: (entity as Space).presentValuation,
        })
        const spaceCreatedAt = (entity as Space).createdAt
          ? formatDistanceToNow(new Date((entity as Space).createdAt ?? ""), {
              addSuffix: true,
            })
          : null
        setDisplayDate(spaceCreatedAt ?? "")
        break
      case EntityType.ASSET:
        setEntityTitle((entity as Asset).assetName)
        setInfo({
          infoHeader: "Identifier",
          infoValue: (entity as Asset).identifier,
        })
        setValuation({
          valuationHeader: "Present Valuation",
          valuationAmount: (entity as Asset).presentValuation,
        })
        const assetCreatedAt = (entity as Asset).createdAt
          ? formatDistanceToNow(new Date((entity as Asset).createdAt ?? ""), {
              addSuffix: true,
            })
          : null
        setDisplayDate(assetCreatedAt ?? "")
        break
      case EntityType.DEBT:
        setEntityTitle((entity as Debt).debtPurpose)
        setInfo({
          infoHeader: "Next EMI Date",
          infoValue: formatDate((entity as Debt).nextEmiDate),
        })
        setValuation({
          valuationHeader: "EMI",
          valuationAmount: (entity as Debt).emi,
        })
        const debtCreatedAt = (entity as Debt).createdAt
          ? formatDistanceToNow(new Date((entity as Debt).createdAt ?? ""), {
              addSuffix: true,
            })
          : null
        setDisplayDate(debtCreatedAt ?? "")
        break
      case EntityType.GOAL:
        setEntityTitle(formatDate((entity as Goal).goalDate, false))
        setInfo({
          infoHeader: "Goal Date",
          infoValue: formatDate((entity as Goal).goalDate, true),
        })
        setValuation({
          valuationHeader: "Goal",
          valuationAmount: (entity as Goal).goalAmount,
        })
        const goalCreatedAt = (entity as Goal).createdAt
          ? formatDistanceToNow(new Date((entity as Goal).createdAt ?? ""), {
              addSuffix: true,
            })
          : null
        setDisplayDate(goalCreatedAt ?? "")
        break
      case EntityType.CASHFLOW:
        setEntityTitle((entity as Cashflow).description)
        setInfo({
          infoHeader: "Flow Direction",
          infoValue: (entity as Cashflow).flowDirection,
        })
        setValuation({
          valuationHeader: "Cashflow Amount",
          valuationAmount: (entity as Cashflow).amount,
        })
        const cashflowCreatedAt = (entity as Cashflow).createdAt
          ? formatDistanceToNow(
              new Date((entity as Cashflow).createdAt ?? ""),
              {
                addSuffix: true,
              }
            )
          : null
        setDisplayDate(cashflowCreatedAt ?? "")
        break
      case EntityType.NEWS:
        setEnytityBadgeText((entity as Article).source?.name || "NEWS")
        setEntityTitle((entity as Article).title ?? "")
        setEntityDescription((entity as Article).description || null)
        const newsPublishedAt = (entity as Article).publishedAt
          ? formatDistanceToNow(
              new Date((entity as Article).publishedAt ?? ""),
              {
                addSuffix: true,
              }
            )
          : null
        setDisplayDate(newsPublishedAt ?? "")
        break
      default:
        break
    }
  }, [entityType, entity])

  if (entityType === EntityType.NEWS) {
    return (
      <Card className="w-full max-w-xs mx-auto h-[22rem] flex flex-col relative hover:shadow-md transition-shadow bg-background border-border text-white pt-0 overflow-hidden">
        <div className="relative aspect-video overflow-hidden bg-muted rounded-t-3xl">
          <Show
            condition={!!(entity as Article).urlToImage && !articleImageError}
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
                (entity as Article).urlToImage ??
                uiConstants.newsFallbackImageUrl
              }
              alt={(entity as Article).title || "News image"}
              className="object-cover w-full h-full transition-transform duration-300 hover:scale-105 rounded-t-3xl"
              onError={handleArticleImageError}
            />
          </Show>
          <div className="absolute inset-0 bg-gradient-to-t from-background to-background/60" />
          <Badge className="absolute top-2 left-2 bg-primary/90 hover:bg-primary text-black">
            {entityBadgeText}
          </Badge>
          <div className="absolute top-2 right-2">
            <IconContainer>{entityIconMap[entityType]}</IconContainer>
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
          <p className="text-sm line-clamp-3 mt-2 text-neutral-300">
            {entityDescription || "No description available"}
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
            <EntitySummarizer
              entityDetails={JSON.stringify(entity)}
              entityType={entityType}
            />
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          {(entity as Article).url && (
            <Button
              variant="default"
              asChild
              className="w-full gap-2 bg-border hover:bg-border bg-neutral-800 hover:bg-neutral-800/90"
            >
              <Link
                href={(entity as Article).url ?? ""}
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
    <EntityDetails
      entityType={entityType as unknown as EntityTypeForDetailModal}
      entity={entity as unknown as Asset | Debt | Goal | Cashflow}
    >
      <Card
        onClick={(): void =>
          entityType === EntityType.SPACE
            ? router.push(`/apps/assetmanager/space/${(entity as Space)._id}`)
            : undefined
        }
        className="bg-background/2 border h-[15rem] backdrop-blur-sm border-border p-2 rounded-3xl hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
      >
        <CardHeader className="flex mt-6 items-start gap-2">
          <div className="flex min-w-0 flex-1 gap-2">
            <h2 className=" text-xl truncate break-all">{enityTitle}</h2>
            <div className="mt-1 shrink-0">
              <Show
                condition={
                  (entityType === EntityType.ASSET &&
                    (entity as Asset).isMatured) ||
                  (entityType === EntityType.DEBT && (entity as Debt).isMatured)
                }
              >
                <Tooltip>
                  <TooltipTrigger>
                    <OctagonAlert className="h-4 w-4 text-secondary" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-background text-white border-border">
                    This {entityType} is matured
                  </TooltipContent>
                </Tooltip>
              </Show>
              <Show
                condition={
                  (entityType === EntityType.ASSET &&
                    (entity as Asset).isMaturityApproaching) ||
                  (entityType === EntityType.DEBT &&
                    (entity as Debt).isMaturityApproaching)
                }
              >
                <Tooltip>
                  <TooltipTrigger>
                    <OctagonAlert className="h-4 w-4 text-amber-400" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-background text-white border-border">
                    This {entityType} is about to mature
                  </TooltipContent>
                </Tooltip>
              </Show>
            </div>
          </div>
          <div className="shrink-0">
            <IconContainer>{entityIconMap[entityType]}</IconContainer>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-300">
                {info.infoHeader}
              </span>
              <span className="text-sm font-medium">
                <Show
                  condition={entityType === EntityType.ASSET}
                  fallback={info.infoValue}
                >
                  <MaskText value={info.infoValue} />
                </Show>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-300">
                {valuation.valuationHeader}
              </span>
              <span className="text-lg font-bold text-white">
                {formatCurrency(
                  valuation.valuationAmount ?? 0,
                  user.baseCurrency
                )}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <span className="flex gap-2">
            <HistoryIcon className="h-4 w-4" />
            <p className="text-xs">{displayDate}</p>
          </span>
          <div onClick={(e) => e.stopPropagation()}>
            <EntitySummarizer
              entityDetails={JSON.stringify(entity)}
              entityType={entityType}
            />
          </div>
        </CardFooter>
      </Card>
    </EntityDetails>
  )
}

export function AddEntityCard({ entityType }: { entityType: EntityType }) {
  return (
    <Link href={createEntityUrlMap[entityType] ?? ""}>
      <Card className="bg-background/2 flex flex-row h-[15rem] items-center justify-center backdrop-blur-sm border border-border rounded-3xl relative overflow-hidden hover:shadow-md hover:shadow-primary/20">
        <IconContainer>
          <Plus className="w-4 h-4" />
        </IconContainer>
        <p className="text-lg font-medium capitalize">Add {entityType}</p>
      </Card>
    </Link>
  )
}
