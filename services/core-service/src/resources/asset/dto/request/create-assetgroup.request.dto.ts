import { z } from "zod"
import { createZodDto } from "nestjs-zod"
import { BaseAgentSchema } from "@/intelligence/agent/agent.schema"

const CreateAssetGroupSchema = z.object({
  assetgroupName: z.string().describe("asset group name given by user"),
})

export const CreateAssetGroupServiceSchema = BaseAgentSchema.extend(
  CreateAssetGroupSchema.shape
)

export class CreateAssetGroupRequestDto extends createZodDto(
  CreateAssetGroupSchema
) {}
