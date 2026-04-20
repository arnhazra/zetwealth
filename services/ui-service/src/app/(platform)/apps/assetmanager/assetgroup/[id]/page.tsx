"use client"
import useQuery from "@/shared/hooks/use-query"
import { endPoints } from "@/shared/constants/api-endpoints"
import HTTPMethods from "@/shared/constants/http-methods"
import { use } from "react"
import { Asset, AssetGroup } from "@/shared/constants/types"
import SectionPanel from "@/shared/components/section-panel"
import { Layers2, Pen, Trash } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { useRouter } from "nextjs-toploader/app"
import { useConfirmContext } from "@/shared/providers/confirm.provider"
import { usePlatformConfig } from "@/context/platformconfig.provider"
import notify from "@/shared/hooks/use-notify"
import IconContainer from "@/shared/components/icon-container"
import {
  AddResourceCard,
  ResourceCard,
} from "@/shared/components/resource-card"
import { ResourceType } from "@/shared/components/resource-card/data"
import { useUserContext } from "@/context/user.provider"
import { buildQueryUrl } from "@/shared/lib/build-url"
import api from "@/shared/lib/ky-api"
import Link from "next/link"
import { formatCurrency } from "@/shared/lib/format-currency"

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: assetgroupId = "" } = use(params)
  const router = useRouter()
  const [{ searchKeyword, user }] = useUserContext()
  const { confirm } = useConfirmContext()

  const assetgroup = useQuery<AssetGroup>({
    queryKey: ["get-assetgroup", assetgroupId],
    queryUrl: `${endPoints.assetgroup}/${assetgroupId}`,
    method: HTTPMethods.GET,
  })

  const assets = useQuery<Asset[]>({
    queryKey: ["get-assets", assetgroupId, searchKeyword],
    queryUrl: buildQueryUrl(`${endPoints.asset}/assetgroup/${assetgroupId}`, {
      searchKeyword: encodeURIComponent(searchKeyword),
    }),
    method: HTTPMethods.GET,
    suspense: !!searchKeyword ? false : true,
  })

  const renderAssets = assets?.data?.map((asset) => {
    return (
      <ResourceCard
        resourceType={ResourceType.ASSET}
        resource={asset}
        key={asset._id}
      />
    )
  })

  const { platformConfig } = usePlatformConfig()
  const handleDeleteAssetGroup = async () => {
    if (assets.data?.length) {
      notify(platformConfig?.otherConstants.assetgroupDeleteWarning, "warning")
      return
    }
    const confirmed = await confirm({
      title: "Delete Asset Group",
      desc: "Are you sure you want to delete this asset group?",
    })

    if (confirmed) {
      try {
        await api.delete(`${endPoints.assetgroup}/${assetgroupId}`)
        router.push("/apps/assetmanager")
      } catch (error) {
        notify(platformConfig?.otherConstants.assetgroupDeleteFailed, "error")
      }
    }
  }

  return (
    <div className="mx-auto grid w-full items-start gap-6">
      <section>
        <SectionPanel
          icon={
            <IconContainer>
              <Layers2 className="h-4 w-4" />
            </IconContainer>
          }
          title={assetgroup.data?.assetgroupName || ""}
          content={`Valuation: ${formatCurrency(assetgroup.data?.currentValuation ?? 0, user.baseCurrency)}`}
          actionComponents={[
            <Link
              href={`/apps/assetmanager/createoreditassetgroup?id=${assetgroupId}`}
            >
              <Button
                variant="default"
                size="icon"
                className="p-2 bg-primary hover:bg-primary text-black"
              >
                <Pen className="h-4 w-4" />
              </Button>
            </Link>,
            <Button
              onClick={handleDeleteAssetGroup}
              variant="secondary"
              size="icon"
            >
              <Trash className="h-4 w-4" />
            </Button>,
          ]}
        />
        <div className="mx-auto grid gap-4 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-4 mt-4">
          <AddResourceCard resourceType={ResourceType.ASSET} />
          {renderAssets}
        </div>
      </section>
    </div>
  )
}
