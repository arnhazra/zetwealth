import { z } from "zod"
import { createZodDto } from "nestjs-zod"

export const ChatSchema = z.object({
  prompt: z.string().min(1),
  threadId: z.string().optional(),
})

export class ChatDto extends createZodDto(ChatSchema) {}
