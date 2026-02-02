import { formatDateString } from "@/shared/utils/date-formatter"
import { Cashflow, FlowFrequency } from "../schemas/cashflow.schema"

export function computeNextDate(cashflow: Cashflow): string {
  const baseDate = cashflow.nextExecutionAt
    ? new Date(cashflow.nextExecutionAt)
    : new Date()

  let nextExecution: Date | null = null
  switch (cashflow.frequency) {
    case FlowFrequency.DAILY:
      nextExecution = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000)
      break

    case FlowFrequency.WEEKLY:
      nextExecution = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      break

    case FlowFrequency.MONTHLY: {
      const day = baseDate.getDate()
      const month = baseDate.getMonth()
      const year = baseDate.getFullYear()
      let nextMonth = month + 1
      let nextYear = year
      if (nextMonth > 11) {
        nextMonth = 0
        nextYear++
      }
      let nextDate = new Date(
        nextYear,
        nextMonth,
        day,
        baseDate.getHours(),
        baseDate.getMinutes(),
        baseDate.getSeconds(),
        baseDate.getMilliseconds()
      )
      if (nextDate.getMonth() !== nextMonth) {
        nextDate = new Date(
          nextYear,
          nextMonth + 1,
          0,
          baseDate.getHours(),
          baseDate.getMinutes(),
          baseDate.getSeconds(),
          baseDate.getMilliseconds()
        )
      }
      nextExecution = nextDate
      break
    }
    case FlowFrequency.YEARLY: {
      const day = baseDate.getDate()
      const month = baseDate.getMonth()
      const year = baseDate.getFullYear()
      let nextYear = year + 1
      let nextDate = new Date(
        nextYear,
        month,
        day,
        baseDate.getHours(),
        baseDate.getMinutes(),
        baseDate.getSeconds(),
        baseDate.getMilliseconds()
      )
      if (nextDate.getMonth() !== month) {
        nextDate = new Date(
          nextYear,
          month + 1,
          0,
          baseDate.getHours(),
          baseDate.getMinutes(),
          baseDate.getSeconds(),
          baseDate.getMilliseconds()
        )
      }
      nextExecution = nextDate
      break
    }
    default:
      nextExecution = null
  }

  return formatDateString(nextExecution)
}
