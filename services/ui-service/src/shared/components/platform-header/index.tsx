import Link from "next/link"
import { TrendingUp } from "lucide-react"
import HeaderSearch from "./search/header-search"
import { UserNav } from "./user-nav"
import IconContainer from "../icon-container"
import { usePathname } from "next/navigation"
import useQuery from "@/shared/hooks/use-query"
import { AppsConfig } from "@/shared/constants/types"
import { endPoints } from "@/shared/constants/api-endpoints"
import HTTPMethods from "@/shared/constants/http-methods"
import Show from "../show"
import * as Icons from "lucide-react"
import { PLATFORM_NAME } from "@/shared/constants/config"

export default function PlatformHeader() {
  const pathName = usePathname()
  const apps = useQuery<AppsConfig>({
    queryKey: ["app-config"],
    queryUrl: `${endPoints.getConfig}/app-config`,
    method: HTTPMethods.GET,
  })

  const selectedApp = apps.data?.apps.find((app) =>
    pathName.includes(app.appName)
  )

  const AppIcon = selectedApp
    ? (Icons as any)[selectedApp.icon]
    : Icons.HelpCircle

  return (
    <header className="relative z-50 top-0 flex h-[64px] items-center bg-background text-white">
      <div className="mx-auto flex w-full max-w-[88rem] items-center justify-between px-4 md:px-6">
        <Show condition={!!selectedApp}>
          <Link
            href={selectedApp?.url ?? "/dashboard"}
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <IconContainer>
              <AppIcon className="h-4 w-4" />
            </IconContainer>
            <span className="hidden md:inline text-sm">
              {selectedApp?.displayName}
            </span>
          </Link>
        </Show>
        <Show condition={!selectedApp}>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold"
          >
            <IconContainer>
              <TrendingUp className="h-4 w-4" />
            </IconContainer>
            <span className="hidden md:inline">{PLATFORM_NAME}</span>
          </Link>
        </Show>
        <HeaderSearch />
        <nav className="flex items-center justify-end flex-1">
          <UserNav />
        </nav>
      </div>
    </header>
  )
}
