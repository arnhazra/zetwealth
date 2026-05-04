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
import { CalendarEvent } from "@/shared/constants/types"
import useQuery from "@/shared/hooks/use-query"
import HTTPMethods from "@/shared/constants/http-methods"
import Show from "@/shared/components/show"

interface EventFormData {
  eventDate?: string
  eventName?: string
}

type MessageType = "success" | "error"

export default function Page() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get("id")
  const selectedDateParam = searchParams.get("selectedDate")
  const [formData, setFormData] = useState<EventFormData>({
    eventDate: selectedDateParam
      ? formatDateString(selectedDateParam)
      : undefined,
    eventName: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const event = useQuery<CalendarEvent>({
    queryKey: ["get-event-details", eventId ?? ""],
    queryUrl: `${endPoints.events}/${eventId}`,
    method: HTTPMethods.GET,
    suspense: false,
    enabled: !!eventId,
  })

  useEffect(() => {
    if (!!event.error || (!event.isLoading && eventId && !event.data)) {
      router.push("/apps/calendar/addorupdateevent")
    }
    if (event.data) {
      setFormData({
        eventDate: formatDateString(event.data.eventDate),
        eventName: event.data.eventName,
      })
    }
  }, [event.data, event.error, event.isLoading])

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

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ msg: "", type: "success" })

    if (eventId) {
      try {
        await api.put(`${endPoints.events}/${eventId}`, {
          json: formData,
        })
        setMessage({ msg: "Event updated successfully!", type: "success" })
      } catch (error) {
        setMessage({
          msg: "Failed to update Event. Please try again.",
          type: "error",
        })
      } finally {
        setIsSubmitting(false)
      }
    } else {
      try {
        await api.post(endPoints.events, {
          json: formData,
        })
        setMessage({ msg: "Event added successfully!", type: "success" })
        setFormData({})
      } catch (error) {
        setMessage({
          msg: "Failed to add event. Please try again.",
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
                <CalendarIcon className="h-4 w-4" />
              </IconContainer>
              <Show condition={!!eventId} fallback="Add Event">
                Edit Event
              </Show>
            </CardTitle>
            <CardDescription className="text-primary">
              Fill in the details for your event
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-theme-200">Event Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background border-border text-theme-100 hover:bg-background",
                        !formData.eventDate && "text-theme-500"
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
                      className="bg-background text-theme-100"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventName" className="text-theme-200">
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
                  className="bg-background border-border text-theme-100 placeholder:text-theme-500 focus:border-theme-600"
                />
              </div>

              <div className="flex">
                <Button
                  type="submit"
                  variant="default"
                  className="bg-primary hover:bg-primary ml-auto"
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
