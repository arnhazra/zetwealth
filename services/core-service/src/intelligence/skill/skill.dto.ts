import { z } from "zod"

export const ReadSkillSchema = z.object({
  skillKey: z
    .string()
    .describe(
      "The skill key to fetch from config (e.g. skill:goals, skill:finance, skill:tasks)"
    ),
})
