"use client"
import type React from "react"
import { useEffect, useState } from "react"
import useQuery from "@/shared/hooks/use-query"
import HTTPMethods from "@/shared/constants/http-methods"
import {
  Asset,
  Cashflow,
  FlowDirection,
  FlowFrequency,
} from "@/shared/constants/types"
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
import { CalendarIcon, Workflow } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"
import { Calendar } from "@/shared/components/ui/calendar"
import { cn } from "@/shared/lib/utils"
import { endPoints } from "@/shared/constants/api-endpoints"
import { formatDate, formatDateString } from "@/shared/lib/date-formatter"
import api from "@/shared/lib/ky-api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import IconContainer from "@/shared/components/icon-container"
import { useSearchParams } from "next/navigation"
import { useRouter } from "nextjs-toploader/app"

interface CashflowFormData {
  description?: string
  targetAsset?: string
  flowDirection?: FlowDirection
  amount?: number
  frequency?: FlowFrequency
  nextExecutionAt?: string
}

type MessageType = "success" | "error"

export default function Page() {
  const searchParams = useSearchParams()
  const cashflowId = searchParams.get("id")
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CashflowFormData>({})
  const [message, setMessage] = useState<{ msg: string; type: MessageType }>({
    msg: "",
    type: "success",
  })

  const { data: assetOptions = [], isLoading: isAssetOptionsLoading } =
    useQuery<Asset[]>({
      queryKey: ["find-assets-by-type"],
      queryUrl: `${endPoints.asset}/findassetsbytypes`,
      method: HTTPMethods.POST,
      requestBody: { assetTypes: ["RETIREMENT", "LIQUID", "OTHER"] },
      suspense: false,
    })

  const cashflow = useQuery<Cashflow>({
    queryKey: ["get-cashflow", cashflowId ?? "", isAssetOptionsLoading],
    queryUrl: `${endPoints.cashflow}/${cashflowId}`,
    method: HTTPMethods.GET,
    suspense: false,
    enabled: !!cashflowId && !isAssetOptionsLoading,
  })

  const handleInputChange = <K extends keyof CashflowFormData>(
    field: K,
    value: CashflowFormData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  useEffect(() => {
    if (
      !!cashflow.error ||
      (!cashflow.isLoading &&
        cashflowId &&
        !cashflow.data &&
        !isAssetOptionsLoading)
    ) {
      router.push("/apps/cashflow/createoreditcashflow")
    }
    if (cashflow.data) {
      setFormData({
        description: cashflow.data.description,
        targetAsset: cashflow.data.targetAsset,
        flowDirection: cashflow.data.flowDirection,
        amount: cashflow.data.amount,
        frequency: cashflow.data.frequency,
        nextExecutionAt: cashflow.data.nextExecutionAt,
      })
    }
  }, [cashflow.data, cashflow.error, cashflow.isLoading, isAssetOptionsLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ msg: "", type: "success" })

    if (cashflowId) {
      try {
        await api.put(`${endPoints.cashflow}/${cashflowId}`, {
          json: formData,
        })
        setMessage({ msg: "Cashflow updated successfully!", type: "success" })
      } catch (error) {
        setMessage({
          msg: "Failed to update cashflow. Please try again.",
          type: "error",
        })
      } finally {
        setIsSubmitting(false)
      }
    } else {
      try {
        await api.post(endPoints.cashflow, {
          json: formData,
        })
        setMessage({ msg: "Cashflow added successfully!", type: "success" })
        setFormData({})
      } catch (error) {
        setMessage({
          msg: "Failed to add cashflow. Please try again.",
          type: "error",
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-background border-border">
          <CardHeader className="border-b border-theme-800">
            <CardTitle className="text-2xl flex items-center gap-2 text-theme-100">
              <IconContainer>
                <Workflow className="h-4 w-4" />
              </IconContainer>
              {cashflowId ? "Edit Cashflow" : "Add Cashflow"}
            </CardTitle>
            <CardDescription className="text-primary">
              {cashflowId
                ? "Edit your cashflow details."
                : "Fill in the details for your cashflow."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-theme-200">
                  Description
                </Label>
                <Input
                  required
                  id="description"
                  type="text"
                  value={formData.description || ""}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Description of the cashflow"
                  className="bg-background border-border text-theme-100 placeholder:text-theme-500 focus:border-theme-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAsset" className="text-theme-200">
                  Target Asset
                </Label>
                <Select
                  value={formData.targetAsset || ""}
                  onValueChange={(value) =>
                    handleInputChange("targetAsset", value)
                  }
                  required
                >
                  <SelectTrigger className="w-full bg-background text-white border-border">
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent className="w-full bg-background text-white border-border">
                    {assetOptions.map((asset) => (
                      <SelectItem key={asset._id} value={asset._id}>
                        {asset.assetName} - {asset.identifier} (
                        {asset.assetType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="flowDirection" className="text-theme-200">
                  Flow Direction
                </Label>
                <Select
                  value={formData.flowDirection || ""}
                  onValueChange={(value) =>
                    handleInputChange("flowDirection", value as FlowDirection)
                  }
                  required
                >
                  <SelectTrigger className="w-full bg-background text-white border-border">
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent className="w-full bg-background text-white border-border">
                    {Object.values(FlowDirection).map((direction) => (
                      <SelectItem key={direction} value={direction}>
                        {direction.charAt(0) + direction.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-theme-200">
                  Amount
                </Label>
                <Input
                  required
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "amount",
                      Number.parseFloat(e.target.value)
                    )
                  }
                  placeholder="0.00"
                  className="bg-background border-border text-theme-100 placeholder:text-theme-500 focus:border-theme-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency" className="text-theme-200">
                  Frequency
                </Label>
                <Select
                  value={formData.frequency || ""}
                  onValueChange={(value) =>
                    handleInputChange("frequency", value as FlowFrequency)
                  }
                  required
                >
                  <SelectTrigger className="w-full bg-background text-white border-border">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent className="w-full bg-background text-white border-border">
                    {Object.values(FlowFrequency).map((frequency) => (
                      <SelectItem key={frequency} value={frequency}>
                        {frequency.charAt(0) + frequency.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-theme-200">Initial Execution Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background border-border text-theme-100 hover:bg-background",
                        !formData.nextExecutionAt && "text-theme-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.nextExecutionAt
                        ? formatDate(formData.nextExecutionAt)
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background border-border">
                    <Calendar
                      mode="single"
                      captionLayout="dropdown"
                      startMonth={new Date()}
                      endMonth={new Date(2100, 0)}
                      selected={new Date(formData.nextExecutionAt ?? "")}
                      disabled={(date) => date < new Date()}
                      onSelect={(date) =>
                        handleInputChange(
                          "nextExecutionAt",
                          formatDateString(date)
                        )
                      }
                      showOutsideDays={false}
                      className="bg-background text-theme-100"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex">
                <Button
                  type="submit"
                  variant="default"
                  className="bg-primary hover:bg-primary ml-auto"
                  disabled={isSubmitting}
                >
                  {cashflowId ? "Save Cashflow" : "Add Cashflow"}
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
