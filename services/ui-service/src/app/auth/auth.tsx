"use client"
import { platformName, uiConstants } from "@/shared/constants/global-constants"
import Cookies from "js-cookie"
import { useState } from "react"
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

interface AuthProviderProps {
  onAuthorized: (isAuthorized: boolean) => void
}

export default function AuthenticationPage({
  onAuthorized,
}: AuthProviderProps) {
  const [isAuthLoading, setAuthLoading] = useState<boolean>(false)

  const googleOAuthLogin = (userData: any) => {
    setAuthLoading(true)

    try {
      Cookies.set("accessToken", userData.accessToken, defaultCookieOptions)
      Cookies.set("refreshToken", userData.refreshToken, defaultCookieOptions)
      onAuthorized(true)
    } catch (error: any) {
      notify(uiConstants.connectionErrorMessage, "error")
      onAuthorized(false)
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <>
      <HomePageHeader />
      <div className="fixed inset-0 overflow-y-auto flex justify-center items-center auth-landing">
        <Card className="mx-auto w-full max-w-sm bg-background border-border text-white">
          <CardHeader>
            <CardTitle className="text-2xl">{platformName}</CardTitle>
            <CardDescription className="text-primary">
              Authenticate to Continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <GoogleOAuth handleSuccess={googleOAuthLogin} />
            </div>
            <div className="mt-4 text-sm">
              {uiConstants.privacyPolicyStatement}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
