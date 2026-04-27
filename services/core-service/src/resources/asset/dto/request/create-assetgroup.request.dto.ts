import { z } from "zod"
import { createZodDto } from "nestjs-zod"

export const CreateAssetGroupSchema = z.object({
  assetgroupName: z.string().min(1),
})

export class CreateAssetGroupRequestDto extends createZodDto(
  CreateAssetGroupSchema
) {}
