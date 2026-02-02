"use client"
import CopyToClipboard from "@/shared/components/copy"
import SectionPanel from "../../../shared/components/section-panel"
import { Button } from "@/shared/components/ui/button"
import { endPoints } from "@/shared/constants/api-endpoints"
import { platformName, uiConstants } from "@/shared/constants/global-constants"
import { useUserContext } from "@/context/user.provider"
import {
  User,
  AtSign,
  CircleArrowRight,
  Globe,
  Pen,
  Leaf,
  PieChart,
  Sparkles,
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

  const saveSustainabilitySettings = async (updatedSettings: boolean) => {
    try {
      dispatch("setUser", { reduceCarbonEmissions: updatedSettings })
      await api.patch(endPoints.updateAttribute, {
        json: {
          attributeName: "reduceCarbonEmissions",
          attributeValue: updatedSettings,
        },
      })
    } catch (error) {
      notify(uiConstants.genericError, "error")
    }
  }

  const saveAnalyticsSettings = async (updatedSettings: boolean) => {
    try {
      dispatch("setUser", { analyticsData: updatedSettings })
      await api.patch(endPoints.updateAttribute, {
        json: {
          attributeName: "analyticsData",
          attributeValue: updatedSettings,
        },
      })
    } catch (error) {
      notify(uiConstants.genericError, "error")
    }
  }

  const saveIntelligenceUsage = async (updatedSettings: boolean) => {
    try {
      dispatch("setUser", { useIntelligence: updatedSettings })
      await api.patch(endPoints.updateAttribute, {
        json: {
          attributeName: "useIntelligence",
          attributeValue: updatedSettings,
        },
      })
    } catch (error) {
      notify(uiConstants.genericError, "error")
    }
  }

  const viewAIDataAgreement = async (from: string) => {
    const consent = await confirm({
      title: `${platformName} AI Data Agreement`,
      desc: `By enabling ${platformName} AI, you agree to allow ${platformName} the system to process certain data to provide AI-powered 
      enhancements. We want to be completely clear about what that means, what is and isn’t shared, and how your information is handled.
      When you use AI features, the app may send text or structured data to a language model so it can analyze, summarize, 
      or generate helpful responses. This processing happens securely and is designed to improve your experience for example, 
      by offering insights, suggestions, or automated assistance. The data you provide is used only for producing those responses 
      and related functionality. It is not used to build public datasets or to train unrelated models.`,
    })

    if (from === "switch" && !consent) {
      saveIntelligenceUsage(false)
    } else {
      saveIntelligenceUsage(true)
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
              <AvatarFallback className="bg-neutral-800">
                <User className="h-4 w-4 text-primary" />
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
              <Sparkles className="h-4 w-4" />
            </IconContainer>
          }
          title={`${platformName} Intelligence`}
          content={
            <>
              An Intelligent system integrated deeply within {platformName}{" "}
              platform. This uses AI to enhance your experience. View the{" "}
              <span
                className="text-primary cursor-pointer"
                onClick={() => viewAIDataAgreement("link")}
              >
                Intelligence Data Agreement.
              </span>
            </>
          }
          actionComponents={[
            <Switch
              checked={user.useIntelligence}
              onCheckedChange={(value) => {
                if (!value) {
                  saveIntelligenceUsage(value)
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
          title={`${platformName} Analytics`}
          content="Choose whether to save the things you do. If disabled, we still collect anonymous analytics data to improve the app"
          actionComponents={[
            <Switch
              checked={user.analyticsData}
              onCheckedChange={(value): Promise<void> =>
                saveAnalyticsSettings(value)
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
          content={`Turn this settings on to reduce carbon footprints inside ${platformName} by optimizing API calls`}
          actionComponents={[
            <Switch
              checked={user.reduceCarbonEmissions}
              onCheckedChange={(value): Promise<void> =>
                saveSustainabilitySettings(value)
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
