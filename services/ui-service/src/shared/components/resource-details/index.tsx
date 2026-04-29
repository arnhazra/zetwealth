import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Asset, Cashflow, Debt, Goal } from "@/shared/constants/types"
import { DialogDescription, DialogTrigger } from "@radix-ui/react-dialog"
import { ReactNode, useEffect, useState } from "react"
import { Badge } from "../ui/badge"
import { formatKey, formatValue } from "@/shared/lib/format-key-value"
import { Pen, Trash } from "lucide-react"
import notify from "@/shared/hooks/use-notify"
import { usePlatformConfig } from "@/context/platformconfig.provider"
import { useConfirmContext } from "@/shared/providers/confirm.provider"
import { Button } from "../ui/button"
import { useUserContext } from "@/context/user.provider"
import { useQueryClient } from "@tanstack/react-query"
import { formatDate } from "@/shared/lib/date-formatter"
import {
  amountKeys,
  deleteResourceAPIUriMap,
  editResourceUrlMap,
  ResourceTypeForDetailModal,
  excludedKeys,
} from "./data"
import api from "@/shared/lib/ky-api"
import Link from "next/link"
import { ResourceType } from "../resource-card/data"

type ResourceDetailsProps = {
  resourceType: ResourceTypeForDetailModal
  resource: Asset | Debt | Goal | Cashflow
  children: ReactNode
}

enum DeleteQueryKey {
  ASSET = "get-assets",
  DEBT = "get-debts",
  GOAL = "get-goals",
  CASHFLOW = "get-cashflows",
}

export function ResourceDetails({
  resourceType,
  resource,
  children,
}: ResourceDetailsProps) {
  const [{ user }] = useUserContext()
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const { confirm } = useConfirmContext()
  const { platformConfig } = usePlatformConfig()
  const [resourceBadgeText, setEnytityBadgeText] = useState("")
  const [displayName, setDisplayName] = useState("")

  useEffect(() => {
    switch (resourceType) {
      case ResourceTypeForDetailModal.ASSET:
        setEnytityBadgeText((resource as Asset).assetType.replace("_", " "))
        setDisplayName((resource as Asset).assetName)
        break
      case ResourceTypeForDetailModal.DEBT:
        setEnytityBadgeText("DEBT")
        setDisplayName((resource as Debt).debtPurpose)
        break
      case ResourceTypeForDetailModal.GOAL:
        setEnytityBadgeText("GOAL")
        setDisplayName(formatDate((resource as Goal).goalDate))
        break
      case ResourceTypeForDetailModal.CASHFLOW:
        setEnytityBadgeText("CASHFLOW")
        setDisplayName((resource as Cashflow).description)
        break
      default:
        break
    }
  }, [resourceType, resource])

  const deleteResource = async (): Promise<void> => {
    setOpen(false)
    const confirmed = await confirm({
      title: `Delete ${resourceType}`,
      desc: `Are you sure you want to delete this ${resourceType}?`,
    })

    if (confirmed) {
      try {
        await api.delete(
          `${deleteResourceAPIUriMap[resourceType as keyof typeof deleteResourceAPIUriMap]}/${(resource as Asset | Debt | Goal | Cashflow)._id}`
        )
        queryClient.refetchQueries({
          queryKey: [
            `${DeleteQueryKey[resourceType.toUpperCase() as keyof typeof DeleteQueryKey]}`,
          ],
        })
        notify(
          `${platformConfig?.otherConstants.resourceDeleted} ${resourceType}`,
          "success"
        )
      } catch (error) {
        notify(platformConfig?.otherConstants.genericError, "error")
      }
    }
  }

  const isAmount = (key: keyof Asset): boolean => amountKeys.includes(key)

  if ((resourceType as unknown as ResourceType) === ResourceType.ASSETGROUP) {
    return <>{children}</>
  }

  return (
    <Dialog open={open}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {children}
      </DialogTrigger>
      <DialogContent className="w-[25rem] bg-background border-border outline-none text-white [&>button]:hidden">
        <DialogHeader>
          <div className="flex justify-between">
            <div>
              <DialogTitle>{displayName}</DialogTitle>
              <Badge
                variant="default"
                className="bg-primary w-fit text-black mt-2"
              >
                {resourceBadgeText}
              </Badge>
              <DialogDescription></DialogDescription>
            </div>
            <div className="flex gap-2">
              <Link
                href={`${editResourceUrlMap[resourceType as keyof typeof editResourceUrlMap]}?id=${(resource as Asset | Debt | Goal | Cashflow)._id}`}
              >
                <Button
                  variant="default"
                  size="icon"
                  className="p-2 bg-primary hover:bg-primary"
                >
                  <Pen className="text-black h-4 w-4 text-black" />
                </Button>
              </Link>
              <Button onClick={deleteResource} variant="secondary" size="icon">
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="grid gap-6">
          <ul className="grid gap-3 text-sm text-muted-foreground">
            {Object.entries(resource ?? {})
              .filter(([key]) => !excludedKeys.includes(key))
              .map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <strong>{formatKey(key)}</strong>{" "}
                  {formatValue(
                    value,
                    key.includes("Date") || key === "nextExecutionAt",
                    isAmount(key as keyof Asset),
                    user.baseCurrency,
                    key.includes("Rate"),
                    key.includes("identifier") || key === "_id"
                  )}
                </div>
              ))}
          </ul>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={(): void => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
