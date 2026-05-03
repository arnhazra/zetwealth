import { z } from "zod"

export const FindDebtListServiceSchema = z.object({
  userId: z.string().describe("user id of the user"),
  searchKeyword: z
    .string()
    .optional()
    .describe("debt name given by the user to search - this is optional"),
})
