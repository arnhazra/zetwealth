import { z } from "zod"
import { createZodDto } from "nestjs-zod"
import { dateString } from "@/shared/validators/zod.validators"
import { BaseAgentSchema } from "@/intelligence/agent/agent.schema"

const CreateEventSchema = z.object({
  eventDate: dateString.describe(
    "Event date - natural language allowed (e.g., next Friday, in 2 months, 2025-01-31) you need to convert to YYYY-MM-DD format string"
  ),
  eventName: z.string().describe("event purpose given by the user"),
})

export const CreateEventServiceSchema = BaseAgentSchema.extend(
  CreateEventSchema.shape
)

export class CreateEventRequestDto extends createZodDto(CreateEventSchema) {}
