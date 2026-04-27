import { z } from "zod"
import { createZodDto } from "nestjs-zod"
import { dateString } from "@/shared/validators/zod.validators"

export const CreateGoalSchema = z.object({
  goalDate: dateString,
  goalAmount: z.number(),
})

export class CreateGoalRequestDto extends createZodDto(CreateGoalSchema) {}
