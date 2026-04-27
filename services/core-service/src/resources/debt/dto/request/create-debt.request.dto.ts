import { z } from "zod"
import { createZodDto } from "nestjs-zod"
import { dateString } from "@/shared/validators/zod.validators"
import { BaseAgentSchema } from "@/intelligence/agent/agent.schema"

const CreateDebtSchema = z.object({
  debtPurpose: z.string().describe("debt purpose given by the user"),
  identifier: z.string().describe("identifier given by the user"),
  startDate: dateString.describe(
    "start date; natural language allowed (e.g., next Friday, in 2 months, 2025-01-31) you need to convert to YYYY-MM-DD format string"
  ),
  endDate: dateString.describe(
    "end date; natural language allowed (e.g., next Friday, in 2 months, 2025-01-31) you need to convert to YYYY-MM-DD format string"
  ),
  principalAmount: z.coerce
    .number()
    .describe("principal amount given by the user"),
  interestRate: z.coerce.number().describe("interest rate % given by the user"),
})

export const CreateDebtServiceSchema = BaseAgentSchema.extend(
  CreateDebtSchema.shape
)

export class CreateDebtRequestDto extends createZodDto(CreateDebtSchema) {}
