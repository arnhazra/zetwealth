import { z } from "zod"
import { createZodDto } from "nestjs-zod"
import { Currency } from "country-code-enum"
import { User } from "../schemas/user.schema"

export const UpdateAttributeSchema = z.object({
  attributeName: z.custom<keyof User>(),
  attributeValue: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.enum(Currency),
  ]),
})

export class UpdateAttributeDto extends createZodDto(UpdateAttributeSchema) {}
