import { z } from "zod"

export const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD format")

export const monthString = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "must be YYYY-MM format")
