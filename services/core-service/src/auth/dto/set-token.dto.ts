import { z } from "zod"
import { createZodDto } from "nestjs-zod"

export const SetTokenSchema = z.object({
  userId: z.string().min(1),
  token: z.string().min(1),
})

export class SetTokenDto extends createZodDto(SetTokenSchema) {}
