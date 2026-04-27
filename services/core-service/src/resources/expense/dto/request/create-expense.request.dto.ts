import { z } from "zod"
import { createZodDto } from "nestjs-zod"
import { ExpenseCategory } from "@/shared/constants/types"
import { dateString } from "@/shared/validators/zod.validators"

export const CreateExpenseSchema = z.object({
  title: z.string().optional(),
  expenseAmount: z.number(),
  expenseCategory: z.enum(ExpenseCategory),
  expenseDate: dateString,
})

export class CreateExpenseRequestDto extends createZodDto(
  CreateExpenseSchema
) {}
