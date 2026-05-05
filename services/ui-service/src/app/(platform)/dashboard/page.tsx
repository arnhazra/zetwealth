"use client"
import { AppCard } from "@/shared/components/app-card"
import { endPoints } from "@/shared/constants/api-endpoints"
import HTTPMethods from "@/shared/constants/http-methods"
import useQuery from "@/shared/hooks/use-query"
import { useUserContext } from "@/context/user.provider"
import { usePlatformConfig } from "@/context/platformconfig.provider"
import WidgetCard from "@/shared/components/widget-card"
import { Widget } from "@/shared/constants/types"
import { useRouter } from "nextjs-toploader/app"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import api from "@/shared/lib/ky-api"
import { useEffect } from "react"
import notify from "@/shared/hooks/use-notify"

export default function Page() {
  const [{ searchKeyword, user }] = useUserContext()
  const { platformConfig } = usePlatformConfig()
  const userFirstName = user.name?.split(" ")[0]
  const searchParams = useSearchParams()
  const subscriptionSessionId = searchParams.get("sub_session_id")
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: widgetData } = useQuery<Widget[]>({
    queryKey: ["get-widgets"],
    queryUrl: endPoints.widgets,
    method: HTTPMethods.GET,
  })

  const { mutate: subscribe } = useMutation({
    mutationKey: ["subscribe"],
    mutationFn: async (sessionId: string) => {
      const response = await api
        .get(`${endPoints.subscribe}?sub_session_id=${sessionId}`)
        .json()
      return response
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["user-details"] })
      notify(platformConfig?.otherConstants.subscriptionSuccess, "success")
    },
    onError: async (error: any) => {
      notify(platformConfig?.otherConstants.subscriptionFailed, "error")
    },
  })

  useEffect(() => {
    if (!!subscriptionSessionId) {
      subscribe(subscriptionSessionId)
      router.replace("/dashboard")
    }
  }, [subscriptionSessionId])

  const renderApps = () => {
    if (!platformConfig?.appConfig?.apps) return null

    const searchPattern = new RegExp(searchKeyword, "i")
    return platformConfig.appConfig.apps
      .filter(
        (app) =>
          searchPattern.test(app.displayName) ||
          searchPattern.test(app.appName) ||
          searchPattern.test(app.description)
      )
      .map((app) => <AppCard key={app.appName} app={app} />)
  }

  const widgets = widgetData?.map((widget) => {
    return <WidgetCard key={widget.title} widget={widget} />
  })

  return (
    <div className="mx-auto grid w-full items-start gap-6">
      <section>
        <h1 className="text-2xl -mb-2 -mt-2 ms-1">Hey, {userFirstName}</h1>
      </section>
      <section>
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {widgets}
          </div>
        </div>
      </section>
      <section>
        <div className="mx-auto grid justify-center gap-4 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-4">
          {renderApps()}
        </div>
      </section>
    </div>
  )
}
