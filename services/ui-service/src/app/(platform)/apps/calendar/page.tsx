"use client"
import { useEffect, useState } from "react"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns"
import useQuery from "@/shared/hooks/use-query"
import { CalendarEvent } from "@/shared/constants/types"
import { endPoints } from "@/shared/constants/api-endpoints"
import HTTPMethods from "@/shared/constants/http-methods"
import { EventModal } from "@/shared/components/event-modal"
import Link from "next/link"
import { buildQueryUrl } from "@/shared/lib/build-url"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const [selectedMonth, setSelectedMonth] = useState(
    `${format(currentDate, "yyyy-MM")}`
  )

  useEffect(() => {
    setSelectedMonth(`${format(currentDate, "yyyy-MM")}`)
  }, [currentDate])

  const events = useQuery<CalendarEvent[]>({
    queryKey: ["calendar-events", selectedMonth],
    queryUrl: buildQueryUrl(endPoints.events, {
      month: selectedMonth,
    }),
    method: HTTPMethods.GET,
  })

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setIsModalOpen(true)
  }

  const selectedDateIso = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : null
  const selectedDateEvents = selectedDateIso
    ? events.data?.filter(
        (e) => format(e.eventDate, "yyyy-MM-dd") === selectedDateIso
      )
    : []

  return (
    <div className="flex h-screen flex-col pb-4 text-theme-400">
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
        <header className="flex h-16 items-center justify-between border-b border-border px-6">
          <div className="flex">
            <div className="flex items-center rounded-md bg-theme-800 border border-border p-0.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevMonth}
                className="h-8 w-8 text-theme-400 hover:bg-theme-800 hover:text-theme-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <p className="text-sm font-medium tracking-tight text-theme-100">
                {format(currentDate, "MMM, yyyy")}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextMonth}
                className="h-8 w-8 text-theme-400 hover:bg-theme-800 hover:text-theme-100"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/apps/calendar/addorupdateevent">
              <Button
                size="sm"
                variant="default"
                className="gap-2 border-theme-700 bg-primary text-black hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          <div className="grid grid-cols-7 border-b border-border">
            {daysOfWeek.map((day) => (
              <div key={day} className="py-3 text-center text-sm font-medium">
                {day}
              </div>
            ))}
          </div>

          <div className="grid flex-1 grid-cols-7">
            {calendarDays.map((day, i) => {
              const dayIsoString = format(day, "yyyy-MM-dd")
              const dayEvents = events.data?.filter(
                (e) => format(e.eventDate, "yyyy-MM-dd") === dayIsoString
              )
              const isToday = isSameDay(day, new Date())

              return (
                <div
                  key={day.toString()}
                  className={cn(
                    "group relative border-b border-r border-border p-2 transition-colors hover:bg-theme-900/50 cursor-pointer",
                    i % 7 === 6 && "border-r-0",
                    i >= calendarDays.length - 7 && "border-b-0"
                  )}
                  onClick={() => handleDateClick(day)}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center text-sm font-medium rounded-2xl transition-colors",
                      isSameMonth(day, monthStart)
                        ? "text-theme-200"
                        : "text-theme-600",
                      isToday && "bg-theme-100 text-black"
                    )}
                  >
                    {day.getDate()}
                  </span>

                  <div className="mt-2 space-y-1">
                    {dayEvents?.map((event, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-[10px] leading-tight"
                      >
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <div className="h-3 w-3 shrink-0 rounded-2xl bg-primary" />
                          <span className="truncate text-theme-300">
                            {event.eventName}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </main>
      </div>
      <EventModal
        open={isModalOpen && !!selectedDate}
        onOpenChange={(open) => {
          setIsModalOpen(open)
          if (!open) setSelectedDate(null)
          events.refetch()
        }}
        events={selectedDateEvents || []}
        selectedDate={selectedDate}
      />
    </div>
  )
}
