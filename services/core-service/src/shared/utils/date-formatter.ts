import { format } from "date-fns"

export function formatDateString(dateString?: string | number | Date) {
  try {
    if (!dateString) {
      return format(new Date(), "yyyy-MM-dd")
    }

    return format(dateString, "yyyy-MM-dd")
  } catch (error) {
    return format(new Date(), "yyyy-MM-dd")
  }
}
