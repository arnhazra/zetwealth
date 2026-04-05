"use client"
import CopyToClipboard from "@/shared/components/copy"
import SectionPanel from "../../../shared/components/section-panel"
import { Button } from "@/shared/components/ui/button"
import { endPoints } from "@/shared/constants/api-endpoints"
import { uiConstants } from "@/shared/constants/global-constants"
import { useUserContext } from "@/context/user.provider"
import {
  UserIcon,
  AtSign,
  CircleArrowRight,
  Globe,
  Pen,
  Leaf,
  PieChart,
  Sparkle,
} from "lucide-react"
import EditCurrency from "@/shared/components/edit-currency"
import { usePromptContext } from "@/shared/providers/prompt.provider"
import notify from "@/shared/hooks/use-notify"
import IconContainer from "@/shared/components/icon-container"
import { Switch } from "@/shared/components/ui/switch"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar"
import Cookies from "js-cookie"
import { useConfirmContext } from "@/shared/providers/confirm.provider"
import api from "@/shared/lib/ky-api"
import type { User } from "@/shared/constants/types"
import { PLATFORM_NAME } from "@/shared/constants/config"

export default function Page() {
  const [{ user }, dispatch] = useUserContext()
  const { prompt } = usePromptContext()
  const { confirm } = useConfirmContext()

  const editName = async () => {
    const { hasConfirmed, value } = await prompt(false, "Your Name", user.name)

    if (hasConfirmed) {
      try {
        dispatch("setUser", { name: value as string })
        await api.patch(endPoints.updateAttribute, {
          json: {
            attributeName: "name",
            attributeValue: value,
          },
        })
      } catch (error) {
        notify(uiConstants.genericError, "error")
      }
    }
  }

  const signOut = async () => {
    try {
      const refreshToken = Cookies.get("refreshToken")
      await api.post(endPoints.signOut, {
        json: { allDevices: true, refreshToken },
      })
      Cookies.remove("accessToken")
      Cookies.remove("refreshToken")
      window.location.replace("/")
    } catch (error) {
      Cookies.remove("accessToken")
      Cookies.remove("refreshToken")
      window.location.replace("/")
    }
  }

  const updateAttribute = async <K extends keyof User>(
    attributeName: K,
    attributeValue: boolean
  ) => {
    try {
      dispatch("setUser", { [attributeName]: attributeValue })
      await api.patch(endPoints.updateAttribute, {
        json: {
          attributeName,
          attributeValue,
        },
      })
    } catch (error) {
      notify(uiConstants.genericError, "error")
    }
  }

  const viewAIDataAgreement = async (from: string) => {
    const consent = await confirm({
      title: `${PLATFORM_NAME} Intelligence Data Agreement`,
      desc: uiConstants.useIntelligenceStatement,
    })

    if (from === "switch" && !consent) {
      updateAttribute("useIntelligence", false)
    } else {
      updateAttribute("useIntelligence", true)
    }
  }

  return (
    <div className="w-[100%] sm:w-[90%] md:w-[75%] lg:w-[60%] mx-auto">
      <p className="mt-4 mb-4 text-2xl">Your Account</p>
      <section className="grid gap-2 mb-2" id="user-details-section">
        <SectionPanel
          icon={
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src={user.avatar ?? ""} alt={user.name} />
              <AvatarFallback className="bg-theme-800">
                <UserIcon className="h-4 w-4 text-primary" />
              </AvatarFallback>
            </Avatar>
          }
          title="You"
          content={user.name}
          actionComponents={[
            <Button
              onClick={editName}
              className="p-2 bg-primary hover:bg-primary text-black"
              variant="default"
              size="icon"
            >
              <Pen className="h-4 w-4" />
            </Button>,
          ]}
        />
        <SectionPanel
          icon={
            <IconContainer>
              <AtSign className="h-4 w-4" />
            </IconContainer>
          }
          title="Your Email"
          content={user.email}
          actionComponents={[<CopyToClipboard value={user.email} />]}
        />
        <SectionPanel
          icon={
            <IconContainer>
              <Globe className="h-4 w-4" />
            </IconContainer>
          }
          title="Base Currency"
          content={user.baseCurrency}
          actionComponents={[
            <EditCurrency baseCurrency={user.baseCurrency}></EditCurrency>,
          ]}
        />
        <SectionPanel
          icon={
            <IconContainer ai>
              <Sparkle className="h-4 w-4" />
            </IconContainer>
          }
          title={`${PLATFORM_NAME} Intelligence`}
          content={
            <>
              An Intelligent system integrated deeply within {PLATFORM_NAME}{" "}
              platform.
            </>
          }
          actionComponents={[
            <Switch
              checked={user.useIntelligence}
              onCheckedChange={(value) => {
                if (!value) {
                  updateAttribute("useIntelligence", value)
                } else {
                  viewAIDataAgreement("switch")
                }
              }}
            />,
          ]}
        />
        <SectionPanel
          icon={
            <IconContainer>
              <PieChart className="h-4 w-4" />
            </IconContainer>
          }
          title={`${PLATFORM_NAME} Analytics`}
          content="Choose whether to save the things you do"
          actionComponents={[
            <Switch
              checked={user.analyticsData}
              onCheckedChange={(value): Promise<void> =>
                updateAttribute("analyticsData", value)
              }
            />,
          ]}
        />
        <SectionPanel
          icon={
            <IconContainer>
              <Leaf className="h-4 w-4" />
            </IconContainer>
          }
          title="Optimize API Calls"
          content={`Turn this settings on to reduce carbon footprints inside ${PLATFORM_NAME} by optimizing API calls`}
          actionComponents={[
            <Switch
              checked={user.reduceCarbonEmissions}
              onCheckedChange={(value): Promise<void> =>
                updateAttribute("reduceCarbonEmissions", value)
              }
            />,
          ]}
        />
        <SectionPanel
          icon={
            <IconContainer>
              <CircleArrowRight className="h-4 w-4" />
            </IconContainer>
          }
          title="Sign Out"
          content="Sign out of everywhere"
          actionComponents={[
            <Button
              size="icon"
              variant="secondary"
              onClick={(): Promise<void> => signOut()}
            >
              <CircleArrowRight className="h-4 w-4" />
            </Button>,
          ]}
        />
      </section>
    </div>
  )
}
