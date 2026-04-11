"use client"
import { ReactNode, createContext, useContext } from "react"
import {
  ConstantConfig,
  HomeConfig,
  PlatformConfig,
  WidgetConfig,
} from "@/shared/constants/types"
import { endPoints } from "@/shared/constants/api-endpoints"
import useQuery from "@/shared/hooks/use-query"
import HTTPMethods from "@/shared/constants/http-methods"
import Loading from "@/app/loading"

type PlatformConfigContextType = {
  platformConfig: PlatformConfig | undefined
}

const PlatformConfigContext = createContext<PlatformConfigContextType>({
  platformConfig: undefined,
})

export function PlatformConfigProvider({ children }: { children: ReactNode }) {
  const { data: homeConfig, isLoading: homeConfigLoading } =
    useQuery<HomeConfig>({
      queryKey: ["home-config"],
      queryUrl: `${endPoints.getConfig}/home-config`,
      method: HTTPMethods.GET,
      suspense: false,
    })

  const { data: constantsConfig, isLoading: constantsConfigLoading } =
    useQuery<ConstantConfig>({
      queryKey: ["constants-config"],
      queryUrl: `${endPoints.getConfig}/constants-config`,
      method: HTTPMethods.GET,
      suspense: false,
    })

  const { data: widgetConfig, isLoading: widgetConfigLoading } =
    useQuery<WidgetConfig>({
      queryKey: ["widget-config"],
      queryUrl: `${endPoints.getConfig}/widget-config`,
      method: HTTPMethods.GET,
      suspense: false,
    })

  if (homeConfigLoading || constantsConfigLoading || widgetConfigLoading) {
    return <Loading />
  }

  const platformConfig: PlatformConfig = {
    ...homeConfig,
    ...constantsConfig,
    ...widgetConfig,
  } as PlatformConfig

  return (
    <PlatformConfigContext.Provider value={{ platformConfig }}>
      {children}
    </PlatformConfigContext.Provider>
  )
}

export function usePlatformConfig() {
  const context = useContext(PlatformConfigContext)

  if (!context) {
    throw new Error(
      "usePlatformConfig must be used within a PlatformConfigProvider"
    )
  }

  return context
}
