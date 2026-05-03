import { z } from "zod"
import { createZodDto } from "nestjs-zod"

export const SetTokenSchema = z.object({
  userId: z.string(),
  token: z.string(),
})

export class SetTokenDto extends createZodDto(SetTokenSchema) {}
