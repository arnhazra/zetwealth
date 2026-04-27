import { BaseAgentSchema } from "@/intelligence/agent/agent.schema"
import { z } from "zod"

const FindEventByMonthSchema = z.object({
  eventMonth: z
    .string()
    .describe(
      "calculate month given by the user - format should be like 2022-05"
    ),
})

export const FindEventByMonthServiceSchema = BaseAgentSchema.extend(
  FindEventByMonthSchema.shape
)
