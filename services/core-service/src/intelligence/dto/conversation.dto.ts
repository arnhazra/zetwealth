import { z } from "zod"
import { createZodDto } from "nestjs-zod"

export const ConversationSchema = z.object({
  prompt: z.string().min(1),
  threadId: z.string().optional(),
})

export class ConversationDto extends createZodDto(ConversationSchema) {}
