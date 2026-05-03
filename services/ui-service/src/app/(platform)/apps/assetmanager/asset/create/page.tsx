"use client"
import type React from "react"
import { useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { CalendarIcon, Banknote } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"
import { Calendar } from "@/shared/components/ui/calendar"
import {
  AssetType,
  AssetGroup,
  RecurringFrequency,
} from "@/shared/constants/types"
import useQuery from "@/shared/hooks/use-query"
import { endPoints } from "@/shared/constants/api-endpoints"
import HTTPMethods from "@/shared/constants/http-methods"
import { formatDate, formatDateString } from "@/shared/lib/date-formatter"
import api from "@/shared/lib/ky-api"
import IconContainer from "@/shared/components/icon-container"

interface AssetFormData {
  assetgroupId: string
  assetType: AssetType | ""
  assetName: string
  identifier: string
  startDate?: string
  maturityDate?: string
  amountInvested?: number
  expectedReturnRate?: number
  contributionAmount?: number
  contributionFrequency?: RecurringFrequency
  valuationOnPurchase?: number
  currentValuation?: number
  units?: number
  unitPurchasePrice?: number
}

const assetTypeLabels = {
  [AssetType.LUMPSUM_DEPOSIT]: "Lumpsum Deposit",
  [AssetType.RECURRING_DEPOSIT]: "Recurring Deposit",
  [AssetType.METAL]: "Metals",
  [AssetType.REAL_ESTATE]: "Real Estate",
  [AssetType.BOND]: "Bonds",
  [AssetType.LIQUID]: "Liquid Assets",
  [AssetType.RETIREMENT]: "Retirement Funds",
  [AssetType.EQUITY]: "Equity",
  [AssetType.CRYPTO]: "Crypto",
  [AssetType.OTHER]: "Other Assets",
}

const frequencyLabels = {
  [RecurringFrequency.MONTHLY]: "Monthly",
  [RecurringFrequency.QUARTERLY]: "Quarterly",
  [RecurringFrequency.HALF_YEARLY]: "Half Yearly",
  [RecurringFrequency.YEARLY]: "Yearly",
}

type MessageType = "success" | "error"

export default function Page() {
  const [formData, setFormData] = useState<AssetFormData>({
    assetgroupId: "",
    assetType: "",
    assetName: "",
    identifier: "",
  })

  const [message, setMessage] = useState<{ msg: string; type: MessageType }>({
    msg: "",
    type: "success",
  })

  const assetgroups = useQuery<AssetGroup[]>({
    queryKey: ["get-assetgroups"],
    queryUrl: endPoints.assetgroup,
    method: HTTPMethods.GET,
  })

  const handleInputChange = <K extends keyof AssetFormData>(
    field: K,
    value: AssetFormData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      await api.post(endPoints.asset, {
        json: { data: formData },
      })
      setMessage({ msg: "Asset added successfully!", type: "success" })
    } catch (error) {
      setMessage({
        msg: "Failed to add asset. Please try again.",
        type: "error",
      })
    }
  }

  const showDateFields =
    formData?.assetType &&
    [
      AssetType.LUMPSUM_DEPOSIT,
      AssetType.RECURRING_DEPOSIT,
      AssetType.BOND,
    ].includes(formData.assetType as AssetType)

  const showAmountInvested =
    formData?.assetType &&
    [AssetType.LUMPSUM_DEPOSIT, AssetType.BOND].includes(
      formData.assetType as AssetType
    )

  const showExpectedReturn =
    formData?.assetType &&
    [
      AssetType.LUMPSUM_DEPOSIT,
      AssetType.RECURRING_DEPOSIT,
      AssetType.BOND,
    ].includes(formData.assetType as AssetType)

  const showRecurringFields =
    formData?.assetType &&
    [AssetType.RECURRING_DEPOSIT].includes(formData.assetType as AssetType)

  const showValuationOnPurchase =
    formData?.assetType &&
    [AssetType.REAL_ESTATE, AssetType.METAL, AssetType.OTHER].includes(
      formData.assetType as AssetType
    )

  const showCurrentValuation =
    formData?.assetType &&
    [
      AssetType.LIQUID,
      AssetType.RETIREMENT,
      AssetType.REAL_ESTATE,
      AssetType.METAL,
      AssetType.OTHER,
    ].includes(formData.assetType as AssetType)

  const showEquityFields =
    formData.assetType &&
    [AssetType.EQUITY, AssetType.CRYPTO].includes(
      formData.assetType as AssetType
    )

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-background border-border">
          <CardHeader className="border-b border-theme-800">
            <CardTitle className="text-2xl flex items-center gap-2 text-theme-100">
              <IconContainer>
                <Banknote className="h-4 w-4" />
              </IconContainer>
              Add Asset
            </CardTitle>
            <CardDescription className="text-primary">
              Fill in the details for your new asset. Fields will appear based
              on the asset type you select.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="assetType" className="text-theme-200">
                  Select Asset Group
                </Label>
                <Select
                  value={formData.assetgroupId}
                  onValueChange={(value) =>
                    handleInputChange("assetgroupId", value)
                  }
                  required
                >
                  <SelectTrigger className="w-full bg-background text-white border-border">
                    <SelectValue placeholder="Select Asset Group" />
                  </SelectTrigger>
                  <SelectContent className="w-full bg-background text-white border-border">
                    {assetgroups.data?.map((assetgroup) => (
                      <SelectItem key={assetgroup._id} value={assetgroup._id}>
                        {assetgroup.assetgroupName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assetType" className="text-theme-200">
                  Asset Type
                </Label>
                <Select
                  value={formData.assetType}
                  onValueChange={(value) =>
                    handleInputChange(
                      "assetType",
                      value as unknown as AssetType
                    )
                  }
                  required
                >
                  <SelectTrigger className="w-full bg-background text-white border-border">
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent className="w-full bg-background text-white border-border">
                    {Object.entries(assetTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">{label}</div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assetName" className="text-theme-200">
                    Asset Name
                  </Label>
                  <Input
                    id="assetName"
                    value={formData.assetName}
                    onChange={(e) =>
                      handleInputChange("assetName", e.target.value)
                    }
                    placeholder="e.g. Lumpsum Deposit 1"
                    className="w-full bg-background text-white border-border focus:border-primary focus:ring-0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="identifier" className="text-theme-200">
                    Identifier
                  </Label>
                  <Input
                    id="identifier"
                    value={formData.identifier}
                    onChange={(e) =>
                      handleInputChange("identifier", e.target.value)
                    }
                    placeholder="e.g. 7788"
                    className="w-full bg-background text-white border-border focus:border-primary focus:ring-0"
                    required
                  />
                </div>
              </div>

              {/* Conditional Fields */}
              {showDateFields && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-theme-100">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    Date Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-theme-200">Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-background border-border hover:bg-background text-white hover:text-theme-500"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.startDate
                              ? formatDate(formData.startDate)
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-background border-border rounded-lg">
                          <Calendar
                            mode="single"
                            selected={new Date(formData.startDate ?? "")}
                            captionLayout="dropdown"
                            startMonth={new Date(2000, 0)}
                            endMonth={new Date()}
                            disabled={(date) => date > new Date()}
                            onSelect={(date) =>
                              handleInputChange(
                                "startDate",
                                formatDateString(date)
                              )
                            }
                            className="bg-background text-theme-100 rounded-lg border-border"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-theme-200">Maturity Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-background border-border hover:bg-background text-white hover:text-theme-500"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.maturityDate
                              ? formatDate(formData.maturityDate)
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-background border-border rounded-lg">
                          <Calendar
                            mode="single"
                            selected={new Date(formData.maturityDate ?? "")}
                            captionLayout={
                              formData.startDate ? "dropdown" : "label"
                            }
                            startMonth={new Date(formData.startDate ?? 2000)}
                            endMonth={new Date(2100, 0)}
                            disabled={(date) =>
                              formData.startDate
                                ? date < new Date(formData.startDate)
                                : false
                            }
                            onSelect={(date) =>
                              handleInputChange(
                                "maturityDate",
                                formatDateString(date)
                              )
                            }
                            className="bg-background text-theme-100 rounded-lg border-border"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              )}

              {(showAmountInvested || showExpectedReturn) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-theme-100">
                    <Banknote className="h-4 w-4 text-primary" />
                    Investment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {showAmountInvested && (
                      <div className="space-y-2">
                        <Label
                          htmlFor="amountInvested"
                          className="text-theme-200"
                        >
                          Amount Invested
                        </Label>
                        <Input
                          id="amountInvested"
                          type="number"
                          step="0.01"
                          value={formData.amountInvested || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "amountInvested",
                              Number.parseFloat(e.target.value)
                            )
                          }
                          placeholder="0.00"
                          className="w-full bg-background text-white border-border focus:border-primary focus:ring-0"
                        />
                      </div>
                    )}
                    {showExpectedReturn && (
                      <div className="space-y-2">
                        <Label
                          htmlFor="expectedReturnRate"
                          className="text-theme-200"
                        >
                          Expected Rate of Return (%)
                        </Label>
                        <Input
                          id="expectedReturnRate"
                          type="number"
                          step="0.01"
                          value={formData.expectedReturnRate || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "expectedReturnRate",
                              Number.parseFloat(e.target.value)
                            )
                          }
                          placeholder="0.00"
                          className="w-full bg-background text-white border-border focus:border-primary focus:ring-0"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {showRecurringFields && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-theme-100">
                    Recurring Contribution
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="contributionAmount"
                        className="text-theme-200"
                      >
                        Contribution Amount
                      </Label>
                      <Input
                        id="contributionAmount"
                        type="number"
                        step="0.01"
                        value={formData.contributionAmount || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "contributionAmount",
                            Number.parseFloat(e.target.value)
                          )
                        }
                        placeholder="0.00"
                        className="w-full bg-background text-white border-border focus:border-primary focus:ring-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="contributionFrequency"
                        className="text-theme-200"
                      >
                        Contribution Frequency
                      </Label>
                      <Select
                        value={formData.contributionFrequency || ""}
                        onValueChange={(value) =>
                          handleInputChange(
                            "contributionFrequency",
                            value as unknown as RecurringFrequency
                          )
                        }
                      >
                        <SelectTrigger className="w-full bg-background text-white border-border">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent className="w-full bg-background text-white border-border">
                          {Object.entries(frequencyLabels).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {showValuationOnPurchase && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-theme-100">
                    Valuation
                  </h3>
                  <div className="space-y-2">
                    <Label
                      htmlFor="valuationOnPurchase"
                      className="text-theme-200"
                    >
                      Valuation on Purchase
                    </Label>
                    <Input
                      id="valuationOnPurchase"
                      type="number"
                      step="0.01"
                      value={formData.valuationOnPurchase || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "valuationOnPurchase",
                          Number.parseFloat(e.target.value)
                        )
                      }
                      placeholder="0.00"
                      className="w-full bg-background text-white border-border focus:border-primary focus:ring-0"
                    />
                  </div>
                </div>
              )}

              {showCurrentValuation && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-theme-100">
                    Current Value
                  </h3>
                  <div className="space-y-2">
                    <Label
                      htmlFor="currentValuation"
                      className="text-theme-200"
                    >
                      Current Valuation
                    </Label>
                    <Input
                      id="currentValuation"
                      type="number"
                      step="0.01"
                      value={formData.currentValuation || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "currentValuation",
                          Number.parseFloat(e.target.value)
                        )
                      }
                      placeholder="0.00"
                      className="w-full bg-background text-white border-border focus:border-primary focus:ring-0"
                    />
                  </div>
                </div>
              )}

              {showEquityFields && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-theme-100">
                    Equity Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="units" className="text-theme-200">
                        Number of Units
                      </Label>
                      <Input
                        id="units"
                        type="number"
                        value={formData.units || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "units",
                            Number.parseInt(e.target.value)
                          )
                        }
                        placeholder="0"
                        className="w-full bg-background text-white border-border focus:border-primary focus:ring-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="unitPurchasePrice"
                        className="text-theme-200"
                      >
                        Unit Purchase Price
                      </Label>
                      <Input
                        id="unitPurchasePrice"
                        type="number"
                        step="0.01"
                        value={formData.unitPurchasePrice || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "unitPurchasePrice",
                            Number.parseFloat(e.target.value)
                          )
                        }
                        placeholder="0.00"
                        className="w-full bg-background text-white border-border focus:border-primary focus:ring-0"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex">
                <Button
                  type="submit"
                  variant="default"
                  className="bg-primary hover:bg-primary ml-auto text-black"
                >
                  Add Asset
                </Button>
              </div>
            </form>

            {message.msg && (
              <div
                className={`mt-4 text-sm ${message.type === "success" ? "text-primary" : "text-secondary"}`}
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
