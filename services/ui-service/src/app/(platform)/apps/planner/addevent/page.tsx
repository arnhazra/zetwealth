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
import { CalendarIcon } from "lucide-react"
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
import IconContainer from "@/shared/components/icon-container"
import { useRouter } from "nextjs-toploader/app"
import { useSearchParams } from "next/navigation"

interface EventFormData {
  eventDate?: string
  eventName?: string
}

type MessageType = "success" | "error"

export default function Page() {
  const searchParams = useSearchParams()
  const selectedDateParam = searchParams.get("selectedDate")
  const [formData, setFormData] = useState<EventFormData>({
    eventDate: selectedDateParam
      ? formatDateString(selectedDateParam)
      : undefined,
    eventName: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const [message, setMessage] = useState<{ msg: string; type: MessageType }>({
    msg: "",
    type: "success",
  })

  const handleInputChange = <K extends keyof EventFormData>(
    field: K,
    value: EventFormData[K]
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

    try {
      await api.post(endPoints.events, {
        json: formData,
      })
      setMessage({ msg: "Event added successfully!", type: "success" })
      router.push("/apps/planner")
    } catch (error) {
      setMessage({
        msg: "Failed to add event. Please try again.",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-background border-border">
          <CardHeader className="border-b border-neutral-800">
            <CardTitle className="text-2xl flex items-center gap-2 text-neutral-100">
              <IconContainer>
                <CalendarIcon className="h-4 w-4" />
              </IconContainer>
              Add Event
            </CardTitle>
            <CardDescription className="text-primary">
              Fill in the details for your event
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-neutral-200">Event Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background border-border text-neutral-100 hover:bg-background",
                        !formData.eventDate && "text-neutral-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.eventDate
                        ? formatDate(formData.eventDate)
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background border-border">
                    <Calendar
                      mode="single"
                      captionLayout="dropdown"
                      startMonth={new Date()}
                      endMonth={new Date(2100, 0)}
                      selected={new Date(formData.eventDate ?? "")}
                      disabled={(date) => date < new Date()}
                      onSelect={(date) =>
                        handleInputChange("eventDate", formatDateString(date))
                      }
                      showOutsideDays={false}
                      className="bg-background text-neutral-100"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventName" className="text-neutral-200">
                  Event Details
                </Label>
                <Input
                  required
                  id="eventName"
                  type="text"
                  step="0.01"
                  value={formData.eventName || ""}
                  onChange={(e) =>
                    handleInputChange("eventName", e.target.value)
                  }
                  placeholder="Event Name"
                  className="bg-background border-border text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-600"
                />
              </div>

              <div className="flex">
                <Button
                  type="submit"
                  variant="default"
                  className="bg-primary hover:bg-primary ml-auto text-black"
                  disabled={isSubmitting}
                >
                  Save Event
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
