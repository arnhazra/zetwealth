import { z } from "zod"
import { createZodDto } from "nestjs-zod"

export const FindCashflowsSchema = z.object({
  userId: z.string().describe("user id of the user"),
  searchKeyword: z
    .string()
    .optional()
    .describe("optional param if user provide cashflow name"),
})

export class FindCashFlowRequestDto extends createZodDto(FindCashflowsSchema) {}
