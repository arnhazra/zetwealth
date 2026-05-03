import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"
import { CalendarEvent } from "@/shared/constants/types"
import { format } from "date-fns"
import SectionPanel from "../section-panel"
import { Calendar, Pen, Plus, Trash } from "lucide-react"
import IconContainer from "../icon-container"
import { Button } from "../ui/button"
import Show from "../show"
import { endPoints } from "@/shared/constants/api-endpoints"
import notify from "@/shared/hooks/use-notify"
import Link from "next/link"
import { useRouter } from "nextjs-toploader/app"
import api from "@/shared/lib/ky-api"

export function EventModal({
  open,
  onOpenChange,
  events,
  selectedDate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  events: CalendarEvent[]
  selectedDate: Date | null
}) {
  const router = useRouter()
  const deleteEvent = async (eventId: string): Promise<void> => {
    try {
      await api.delete(`${endPoints.events}/${eventId}`)
      onOpenChange(false)
      notify("Event deleted successfully.", "success")
    } catch (error) {
      notify("Failed to delete event.", "error")
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center justify-between gap-4">
            <AlertDialogTitle className="text-white">Events</AlertDialogTitle>
            <Link
              href={`/apps/calendar/addorupdateevent?selectedDate=${selectedDate ? selectedDate.toISOString() : ""}`}
            >
              <Button
                size="sm"
                className="bg-primary text-black hover:bg-primary/90 gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </Link>
          </div>
        </AlertDialogHeader>
        {events && events.length > 0 ? (
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {events.map((event, idx) => (
              <SectionPanel
                key={event._id}
                icon={
                  <IconContainer>
                    <Calendar className="h-4 w-4" />
                  </IconContainer>
                }
                title={event.eventName}
                content={format(event.eventDate, "PPP")}
                actionComponents={[
                  <Show condition={event.eventSource === "Custom"}>
                    <Button
                      size="icon"
                      variant="default"
                      onClick={() =>
                        router.push(
                          `/apps/calendar/addorupdateevent?id=${event._id}`
                        )
                      }
                    >
                      <Pen className="h-4 w-4 text-black" />
                    </Button>
                  </Show>,
                  <Show condition={event.eventSource === "Custom"}>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={(): Promise<void> => deleteEvent(event._id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </Show>,
                ]}
              />
            ))}
          </ul>
        ) : (
          <div className="text-theme-400 text-sm">No events for this date.</div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={(): void => onOpenChange(false)}>
            Close
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
