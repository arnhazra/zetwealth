import { z } from "zod"
import { createZodDto } from "nestjs-zod"
import { ExpenseCategory } from "@/shared/constants/types"
import { BaseAgentSchema } from "@/intelligence/agent/agent.schema"

const FindMyExpensesSchema = z.object({
  monthFilter: z
    .string()
    .optional()
    .describe(
      "optional - defaults to current month; calculate month given by the user - format should be like YYYY-MM"
    ),
  searchKeyword: z
    .string()
    .optional()
    .describe("search keyword given by user - if any"),
  expenseCategory: z
    .enum(ExpenseCategory)
    .optional()
    .describe("expense category given by user - if any"),
})

export const FindMyExpensesServiceSchema = BaseAgentSchema.extend(
  FindMyExpensesSchema.shape
)

export class FindMyExpensesDto extends createZodDto(FindMyExpensesSchema) {}
