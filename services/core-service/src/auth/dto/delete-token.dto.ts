import { z } from "zod"
import { createZodDto } from "nestjs-zod"

export const DeleteTokenSchema = z.object({
  userId: z.string(),
  token: z.string().optional(),
})

export class DeleteTokenDto extends createZodDto(DeleteTokenSchema) {}
