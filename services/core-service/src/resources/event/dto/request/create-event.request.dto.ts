import { z } from "zod"
import { createZodDto } from "nestjs-zod"
import { dateString } from "@/shared/validators/zod.validators"

export const CreateEventSchema = z.object({
  eventDate: dateString,
  eventName: z.string().min(1),
})

export class CreateEventRequestDto extends createZodDto(CreateEventSchema) {}
