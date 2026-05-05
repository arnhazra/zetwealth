"use client"
import { usePlatformConfig } from "@/context/platformconfig.provider"
import Cookies from "js-cookie"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import HomePageHeader from "@/shared/components/homepage-header"
import notify from "@/shared/hooks/use-notify"
import GoogleOAuth from "./google-oauth"
import { defaultCookieOptions } from "@/shared/lib/cookie-params"
import { PLATFORM_NAME } from "@/shared/constants/config"

interface AuthProviderProps {
  onAuthorized: (isAuthorized: boolean) => void
}

export default function AuthProvider({ onAuthorized }: AuthProviderProps) {
  const { platformConfig } = usePlatformConfig()
  const googleOAuthLogin = (userData: any) => {
    try {
      Cookies.set("accessToken", userData.accessToken, defaultCookieOptions)
      Cookies.set("refreshToken", userData.refreshToken, defaultCookieOptions)
      onAuthorized(true)
    } catch (error: any) {
      notify(platformConfig?.otherConstants.connectionErrorMessage, "error")
      onAuthorized(false)
    }
  }

  return (
    <>
      <HomePageHeader />
      <div className="fixed inset-0 overflow-y-auto flex justify-center items-center auth-landing">
        <Card className="mx-auto w-full max-w-sm bg-background border-border text-white">
          <CardHeader>
            <CardTitle className="text-2xl">{PLATFORM_NAME}</CardTitle>
            <CardDescription className="text-theme-200">
              Authenticate to Continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <GoogleOAuth handleSuccess={googleOAuthLogin} />
            </div>
            <div className="mt-4 text-xs">
              {platformConfig?.otherConstants.privacyPolicyStatement}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
