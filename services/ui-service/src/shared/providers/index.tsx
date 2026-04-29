"use client"
import { ReactNode } from "react"
import { FetchProvider } from "./fetch.provider"
import { UserStateProvider } from "../../context/user.provider"
import { PlatformConfigProvider } from "../../context/platformconfig.provider"
import { ConfirmProvider } from "./confirm.provider"
import { PromptProvider } from "./prompt.provider"
import { TooltipProvider } from "../components/ui/tooltip"
import { Toaster } from "sonner"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { colorVars } from "../styles/color-vars"
import { GOOGLE_OAUTH_CLIENT_ID } from "../constants/config"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_OAUTH_CLIENT_ID}>
      <TooltipProvider>
        <FetchProvider>
          <PlatformConfigProvider>
            <UserStateProvider>
              <ConfirmProvider>
                <PromptProvider>{children}</PromptProvider>
              </ConfirmProvider>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: colorVars.background,
                    borderColor: colorVars.border,
                  },
                }}
              />
            </UserStateProvider>
          </PlatformConfigProvider>
        </FetchProvider>
      </TooltipProvider>
    </GoogleOAuthProvider>
  )
}
