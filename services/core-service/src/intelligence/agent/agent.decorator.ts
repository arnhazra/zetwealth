import { SetMetadata } from "@nestjs/common"
import { ZodSchema } from "zod"

export const AGENT_TOOL_METADATA_KEY = "agent:tool"

export interface AgentToolOptions {
  name: string
  description: string
  schema: ZodSchema
}

export const AgentTool = (options: AgentToolOptions): MethodDecorator =>
  SetMetadata(AGENT_TOOL_METADATA_KEY, options)
