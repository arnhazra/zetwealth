import { z } from "zod"
import { createZodDto } from "nestjs-zod"

export const GoogleOAuthSchema = z.object({
  code: z.string().min(1),
})

export class GoogleOAuthDto extends createZodDto(GoogleOAuthSchema) {}
