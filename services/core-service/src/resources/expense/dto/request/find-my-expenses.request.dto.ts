import { z } from "zod"
import { createZodDto } from "nestjs-zod"
import { ExpenseCategory } from "@/shared/constants/types"
import { monthString } from "@/shared/validators/zod.validators"

export const FindMyExpensesQuerySchema = z.object({
  month: monthString.optional(),
  searchKeyword: z.string().optional(),
  category: z.enum(ExpenseCategory).optional(),
})

export class FindMyExpensesQueryDto extends createZodDto(
  FindMyExpensesQuerySchema
) {}
