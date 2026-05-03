import { z } from "zod"
import { createZodDto } from "nestjs-zod"

export const GoogleOAuthSchema = z.object({
  code: z.string(),
})

export class GoogleOAuthDto extends createZodDto(GoogleOAuthSchema) {}
