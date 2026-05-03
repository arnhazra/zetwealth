import { z } from "zod"

export const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD format")
  .refine((val) => {
    const [year, month, day] = val.split("-").map(Number)
    const date = new Date(year, month - 1, day)
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    )
  }, "must be a valid date")

export const monthString = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "must be YYYY-MM format")
