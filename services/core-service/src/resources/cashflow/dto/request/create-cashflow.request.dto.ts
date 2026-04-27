import { z } from "zod"
import { createZodDto } from "nestjs-zod"
import { FlowDirection, FlowFrequency } from "../../schemas/cashflow.schema"
import { dateString } from "@/shared/validators/zod.validators"

export const CreateCashFlowSchema = z.object({
  description: z.string().min(1),
  targetAsset: z.string().min(1),
  flowDirection: z.enum(FlowDirection),
  amount: z.number(),
  frequency: z.enum(FlowFrequency),
  nextExecutionAt: dateString,
})

export class CreateCashFlowRequestDto extends createZodDto(
  CreateCashFlowSchema
) {}
