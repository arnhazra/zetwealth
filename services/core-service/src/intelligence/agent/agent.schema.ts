import { z } from "zod"

export const BaseAgentSchema = z.object({
  userId: z.string().describe("user id of the user"),
})
