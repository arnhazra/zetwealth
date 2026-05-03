import { z } from "zod"
import { createZodDto } from "nestjs-zod"

export const ConversationSchema = z.object({
  prompt: z.string(),
  threadId: z.string().optional(),
})

export class ConversationDto extends createZodDto(ConversationSchema) {}
