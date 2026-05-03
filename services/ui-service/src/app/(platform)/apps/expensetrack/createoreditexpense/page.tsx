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
import { CalendarIcon, HandCoins } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"
import { Calendar } from "@/shared/components/ui/calendar"
import { cn } from "@/shared/lib/utils"
import { endPoints } from "@/shared/constants/api-endpoints"
import { formatDate, formatDateString } from "@/shared/lib/date-formatter"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import useQuery from "@/shared/hooks/use-query"
import { Expense, ExpenseCategoryConfig } from "@/shared/constants/types"
import HTTPMethods from "@/shared/constants/http-methods"
import { useSearchParams } from "next/navigation"
import { useRouter } from "nextjs-toploader/app"
import Show from "@/shared/components/show"
import IconContainer from "@/shared/components/icon-container"
import api from "@/shared/lib/ky-api"

interface ExpenseFormData {
  title?: string
  expenseAmount?: number
  expenseCategory?: string
  expenseDate?: string
}

type MessageType = "success" | "error"

export default function Page() {
  const [formData, setFormData] = useState<ExpenseFormData>({})
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const expenseId = searchParams.get("id")
  const router = useRouter()

  const expenseCategoryConfig = useQuery<ExpenseCategoryConfig>({
    queryKey: ["expense-category-config"],
    queryUrl: `${endPoints.getConfig}/expense-category-config`,
    method: HTTPMethods.GET,
  })

  const expenseDetails = useQuery<Expense>({
    queryKey: ["get-expense-details", expenseId ?? ""],
    queryUrl: `${endPoints.expense}/${expenseId}`,
    method: HTTPMethods.GET,
    enabled: !!expenseId,
    suspense: false,
  })

  useEffect(() => {
    if (
      !!expenseDetails.error ||
      (!expenseDetails.isLoading && !expenseDetails.data)
    ) {
      router.push("/apps/expensetrack/createoreditexpense")
    }

    setFormData({
      expenseAmount: expenseDetails.data?.expenseAmount,
      expenseCategory: expenseDetails.data?.expenseCategory,
      expenseDate: expenseDetails.data?.expenseDate,
      title: expenseDetails.data?.title,
    })
  }, [expenseDetails.data, expenseDetails.error, expenseDetails.isLoading])

  const [message, setMessage] = useState<{ msg: string; type: MessageType }>({
    msg: "",
    type: "success",
  })

  const handleInputChange = <K extends keyof ExpenseFormData>(
    field: K,
    value: ExpenseFormData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ msg: "", type: "success" })

    if (expenseId) {
      try {
        await api.put(`${endPoints.expense}/${expenseId}`, {
          json: formData,
        })
        setMessage({ msg: "Expense updated successfully!", type: "success" })
      } catch (error) {
        setMessage({
          msg: "Failed to update expense. Please try again.",
          type: "error",
        })
      } finally {
        setIsSubmitting(false)
      }
    } else {
      try {
        await api.post(endPoints.expense, {
          json: formData,
        })
        setMessage({ msg: "Expense added successfully!", type: "success" })
      } catch (error) {
        setMessage({
          msg: "Failed to add expense. Please try again.",
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
                <HandCoins className="h-4 w-4" />
              </IconContainer>
              <Show condition={!expenseId} fallback="Edit Expense">
                Add Expense
              </Show>
            </CardTitle>
            <CardDescription className="text-primary">
              Fill in the details for your expense.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-theme-200">
                  Expense Details
                </Label>
                <Input
                  required
                  id="title"
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g. Groceries"
                  className="bg-background border-border text-theme-100 placeholder:text-theme-500 focus:border-theme-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expenseCategory" className="text-theme-200">
                  Expense Category
                </Label>
                <Select
                  value={formData.expenseCategory}
                  onValueChange={(value) =>
                    handleInputChange("expenseCategory", value)
                  }
                  required
                >
                  <SelectTrigger className="w-full bg-background text-white border-border">
                    <SelectValue placeholder="Select expense category" />
                  </SelectTrigger>
                  <SelectContent className="w-full bg-background text-white border-border">
                    {expenseCategoryConfig.data?.expenseCategories.map(
                      (category) => {
                        return (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                            className="rounded-lg"
                          >
                            {category.displayName}
                          </SelectItem>
                        )
                      }
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-theme-200">Expense Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background border-border text-theme-100 hover:bg-border",
                        !formData.expenseDate && "text-theme-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.expenseDate
                        ? formatDate(formData.expenseDate)
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background border-border">
                    <Calendar
                      mode="single"
                      captionLayout="dropdown"
                      startMonth={new Date(2000, 0)}
                      endMonth={new Date(2100, 0)}
                      selected={new Date(formData.expenseDate ?? "")}
                      disabled={(date) => date > new Date()}
                      onSelect={(date) =>
                        handleInputChange("expenseDate", formatDateString(date))
                      }
                      showOutsideDays={false}
                      className="bg-background text-theme-100"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expenseAmount" className="text-theme-200">
                  Expense Amount
                </Label>
                <Input
                  required
                  id="expenseAmount"
                  type="number"
                  step="0.01"
                  value={formData.expenseAmount || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "expenseAmount",
                      Number.parseFloat(e.target.value)
                    )
                  }
                  placeholder="0.00"
                  className="bg-background border-border text-theme-100 placeholder:text-theme-500 focus:border-theme-600"
                />
              </div>

              <div className="flex">
                <Button
                  type="submit"
                  variant="default"
                  className="bg-primary hover:bg-primary ml-auto text-black"
                  disabled={isSubmitting}
                >
                  <Show condition={!expenseId} fallback="Update Expense">
                    Add Expense
                  </Show>
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
