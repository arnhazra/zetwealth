"use client"
import { endPoints } from "@/shared/constants/api-endpoints"
import { ReactNode, useState } from "react"
import Cookies from "js-cookie"
import Show from "@/shared/components/show"
import AuthProvider from "../auth/auth"
import {
  Subscription,
  User,
  UserDetailsResponse,
} from "@/shared/constants/types"
import Loading from "../loading"
import { useQuery as useBaseQuery } from "@tanstack/react-query"
import PlatformHeader from "@/shared/components/platform-header"
import { useUserContext } from "@/context/user.provider"
import Intelligence from "@/shared/components/intelligence"
import notify from "@/shared/hooks/use-notify"
import api from "@/shared/lib/ky-api"
import { usePlatformConfig } from "@/context/platformconfig.provider"
import { SubscriptionModal } from "@/shared/components/subsrcription-modal"

export default function AuthLayout({ children }: { children: ReactNode }) {
  const [, dispatch] = useUserContext()
  const [isAuthorized, setAuthorized] = useState<boolean>(false)
  const { platformConfig } = usePlatformConfig()

  const getUserDetails = async () => {
    if (!Cookies.get("accessToken")) {
      setAuthorized(false)
      return null
    } else {
      try {
        const response: UserDetailsResponse = await api
          .get(endPoints.userDetails)
          .json()
        dispatch("setUser", response.user)
        dispatch("setSubscription", response.subscription)
        setAuthorized(true)
      } catch (error: any) {
        if (error.response) {
          if (error.response.status === 401) {
            setAuthorized(false)
          } else {
            notify(
              platformConfig?.otherConstants.connectionErrorMessage,
              "error"
            )
          }
        } else {
          notify(platformConfig?.otherConstants.genericError, "error")
        }
      } finally {
        return null
      }
    }
  }

  const { isLoading, isFetching } = useBaseQuery({
    queryKey: ["user-details", isAuthorized],
    queryFn: getUserDetails,
    refetchInterval: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })

  const appLayout = (
    <div className="min-h-screen w-full text-white hero-landing relative">
      <PlatformHeader />
      <div className="w-full mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8 mt-4">
        {children}
      </div>
      <Intelligence />
      <SubscriptionModal />
    </div>
  )

  return (
    <Show condition={!isLoading && !isFetching} fallback={<Loading />}>
      <Show condition={!isAuthorized} fallback={appLayout}>
        <AuthProvider onAuthorized={(auth: boolean) => setAuthorized(auth)} />
      </Show>
    </Show>
  )
}
