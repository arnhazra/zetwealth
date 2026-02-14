import { format } from "date-fns"

export function formatDate(
  dateString: string | number | null | undefined | Date,
  showDate: boolean = true,
  showYear: boolean = true
) {
  if (!showYear) {
    return format(dateString ? new Date(dateString) : new Date(), "MMM, do")
  }

  if (showDate) {
    return format(
      dateString ? new Date(dateString) : new Date(),
      "MMM, do yyyy"
    )
  }

  return format(dateString ? new Date(dateString) : new Date(), "MMM yyyy")
}

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
