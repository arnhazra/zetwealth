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
import { CalendarIcon, GoalIcon } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"
import { Calendar } from "@/shared/components/ui/calendar"
import { cn } from "@/shared/lib/utils"
import { endPoints } from "@/shared/constants/api-endpoints"
import useQuery from "@/shared/hooks/use-query"
import { Goal } from "@/shared/constants/types"
import HTTPMethods from "@/shared/constants/http-methods"
import { formatDate, formatDateString } from "@/shared/lib/date-formatter"
import api from "@/shared/lib/ky-api"
import { useSearchParams } from "next/navigation"
import { useRouter } from "nextjs-toploader/app"
import IconContainer from "@/shared/components/icon-container"
import Show from "@/shared/components/show"

interface GoalFormData {
  goalDate?: string
  goalAmount?: number
}

type MessageType = "success" | "error"

export default function Page() {
  const [formData, setFormData] = useState<GoalFormData>({})
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const goalId = searchParams.get("id")
  const router = useRouter()

  const goal = useQuery<Goal>({
    queryKey: ["get-goal", goalId ?? ""],
    queryUrl: `${endPoints.goal}/${goalId}`,
    method: HTTPMethods.GET,
    enabled: !!goalId,
    suspense: false,
  })

  useEffect(() => {
    if (!!goal.error || (!goal.isLoading && !goal.data)) {
      router.push("/apps/wealthplanner/createoreditgoal")
    }

    if (goal.data) {
      const { goalAmount, goalDate } = goal.data
      setFormData({
        goalAmount,
        goalDate,
      })
    }
  }, [goal.data, goal.error, goal.isLoading])

  const [message, setMessage] = useState<{ msg: string; type: MessageType }>({
    msg: "",
    type: "success",
  })

  const handleInputChange = <K extends keyof GoalFormData>(
    field: K,
    value: GoalFormData[K]
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

    if (goalId) {
      try {
        await api.put(`${endPoints.goal}/${goalId}`, {
          json: formData,
        })
        setMessage({ msg: "Goal added successfully!", type: "success" })
      } catch (error) {
        setMessage({
          msg: "Failed to add goal. Please try again.",
          type: "error",
        })
      } finally {
        setIsSubmitting(false)
      }
    } else {
      try {
        await api.post(endPoints.goal, {
          json: formData,
        })
        setMessage({ msg: "Goal added successfully!", type: "success" })
      } catch (error) {
        setMessage({
          msg: "Failed to add goal. Please try again.",
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
                <GoalIcon className="h-4 w-4" />
              </IconContainer>
              <Show condition={!goalId} fallback="Edit Wealth Goal">
                Add Wealth Goal
              </Show>
            </CardTitle>
            <CardDescription className="text-primary">
              Fill in the details for your goal.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-theme-200">Goal Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background border-border text-theme-100 hover:bg-background",
                        !formData.goalDate && "text-theme-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.goalDate
                        ? formatDate(formData.goalDate)
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background border-border">
                    <Calendar
                      mode="single"
                      captionLayout="dropdown"
                      startMonth={new Date()}
                      endMonth={new Date(2100, 0)}
                      selected={new Date(formData.goalDate ?? "")}
                      disabled={(date) => date < new Date()}
                      onSelect={(date) =>
                        handleInputChange("goalDate", formatDateString(date))
                      }
                      showOutsideDays={false}
                      className="bg-background text-theme-100"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalAmount" className="text-theme-200">
                  Goal Amount
                </Label>
                <Input
                  required
                  id="goalAmount"
                  type="number"
                  step="0.01"
                  value={formData.goalAmount || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "goalAmount",
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
                  Save Goal
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
