import { z } from "zod"
import { createZodDto } from "nestjs-zod"
import { ExpenseCategory } from "@/shared/constants/types"
import { dateString } from "@/shared/validators/zod.validators"
import { BaseAgentSchema } from "@/intelligence/agent/agent.schema"

const CreateExpenseSchema = z.object({
  title: z
    .string()
    .optional()
    .describe("expense purpose given by the user - optional"),
  expenseAmount: z.number().describe("expense amount given by the user"),
  expenseCategory: z
    .enum(ExpenseCategory)
    .describe(
      `category of the expense - you should decide based on description user gave, if not then ask`
    ),
  expenseDate: dateString.describe(
    "expense date - natural language allowed (e.g., next Friday, in 2 months, 2025-01-31) you need to convert to YYYY-MM-DD format string"
  ),
})

export const CreateExpenseServiceSchema = BaseAgentSchema.extend(
  CreateExpenseSchema.shape
)

export class CreateExpenseRequestDto extends createZodDto(
  CreateExpenseSchema
) {}
