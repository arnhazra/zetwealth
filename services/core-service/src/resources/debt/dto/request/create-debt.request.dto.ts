import { z } from "zod"
import { createZodDto } from "nestjs-zod"
import { dateString } from "@/shared/validators/zod.validators"

export const CreateDebtSchema = z.object({
  debtPurpose: z.string().min(1),
  identifier: z.string().min(1),
  startDate: dateString,
  endDate: dateString,
  principalAmount: z.number(),
  interestRate: z.number(),
})

export class CreateDebtRequestDto extends createZodDto(CreateDebtSchema) {}
