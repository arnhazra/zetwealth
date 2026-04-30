import { z } from "zod"
import { Injectable } from "@nestjs/common"
import { AgentTool } from "@/intelligence/agent/agent.decorator"
import { ConfigService } from "@/platform/config/config.service"
import { ReadSkillSchema } from "./skill.dto"
import { statusMessages } from "@/shared/constants/status-messages"

@Injectable()
export class SkillService {
  constructor(private readonly configService: ConfigService) {}

  @AgentTool({
    name: "read_skill",
    description:
      "MUST be called before any domain tool. Reads the skill file for a given domain from config. Returns full instructions, prerequisites, and tool usage guidance.",
    schema: ReadSkillSchema,
  })
  async readSkill(dto: z.output<typeof ReadSkillSchema>) {
    try {
      const { skillKey } = dto
      const skillContent = await this.configService.getConfig(skillKey)

      if (!skillContent) {
        return {
          found: false,
          skillKey,
          content:
            "No skill file found for this domain. Proceed with general reasoning.",
        }
      }

      return {
        found: true,
        skillKey,
        content: skillContent,
      }
    } catch (error) {
      throw new Error(error?.message ?? statusMessages.connectionError)
    }
  }
}
