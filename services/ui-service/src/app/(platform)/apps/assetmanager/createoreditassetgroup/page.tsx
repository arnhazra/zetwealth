"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Layers2 } from "lucide-react"
import { AssetGroup } from "@/shared/constants/types"
import { endPoints } from "@/shared/constants/api-endpoints"
import useQuery from "@/shared/hooks/use-query"
import HTTPMethods from "@/shared/constants/http-methods"
import api from "@/shared/lib/ky-api"
import { useSearchParams } from "next/navigation"
import { useRouter } from "nextjs-toploader/app"
import Show from "@/shared/components/show"
import IconContainer from "@/shared/components/icon-container"

interface AssetGroupFormData {
  assetgroupName: string
}

type MessageType = "success" | "error"

export default function Page() {
  const searchParams = useSearchParams()
  const assetgroupId = searchParams.get("id")
  const router = useRouter()

  const assetgroup = useQuery<AssetGroup>({
    queryKey: ["get-assetgroup", assetgroupId ?? ""],
    queryUrl: `${endPoints.assetgroup}/${assetgroupId}`,
    method: HTTPMethods.GET,
    suspense: false,
    enabled: !!assetgroupId,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ msg: string; type: MessageType }>({
    msg: "",
    type: "success",
  })
  const [formData, setFormData] = useState<AssetGroupFormData>({
    assetgroupName: "",
  })

  const handleInputChange = (
    field: keyof AssetGroupFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  useEffect(() => {
    if (!!assetgroup.error || (!assetgroup.isLoading && !assetgroup.data)) {
      router.push("/apps/assetmanager/createoreditassetgroup")
    }

    if (assetgroup.data) {
      setFormData({
        assetgroupName: assetgroup.data?.assetgroupName,
      })
    }
  }, [assetgroup.data, assetgroup.error, assetgroup.isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ msg: "", type: "success" })

    if (assetgroupId) {
      try {
        await api.put(`${endPoints.assetgroup}/${assetgroupId}`, {
          json: formData,
        })
        setMessage({
          msg: "Asset Group updated successfully!",
          type: "success",
        })
      } catch (error) {
        setMessage({ msg: "Error updating Asset Group", type: "error" })
      } finally {
        setIsSubmitting(false)
      }
    } else {
      try {
        await api.post(endPoints.assetgroup, {
          json: formData,
        })
        setMessage({
          msg: "Asset Group created successfully!",
          type: "success",
        })
        setFormData({ assetgroupName: "" })
      } catch (error) {
        setMessage({ msg: "Error creating Asset Group", type: "error" })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-background text-white border-border">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <IconContainer>
                <Layers2 className="h-4 w-4" />
              </IconContainer>
              <Show condition={!assetgroupId} fallback="Edit Asset Group">
                Add Asset Group
              </Show>
            </CardTitle>
            <CardDescription className="text-sm text-primary">
              Fill in the details of your asset group to track your assets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="assetgroupName">
                  Asset Group Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  required
                  id="assetgroupName"
                  placeholder="e.g. HSBC"
                  value={formData.assetgroupName}
                  onChange={(e) =>
                    handleInputChange("assetgroupName", e.target.value)
                  }
                  className="w-full bg-background text-white border-border focus:border-primary focus:ring-0"
                />
              </div>

              <div className="flex">
                <Button
                  className="ml-auto bg-primary hover:bg-primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  Save Asset Group
                </Button>
              </div>
            </form>
            {message.msg && (
              <div
                className={`mt-4 text-sm ${
                  message.type === "success" ? "text-primary" : "text-secondary"
                }`}
              >
                {message.msg}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
