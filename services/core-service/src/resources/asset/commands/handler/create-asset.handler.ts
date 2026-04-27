import { ICommandHandler, CommandHandler } from "@nestjs/cqrs"
import { CreateAssetCommand } from "../impl/create-asset.command"
import { AssetRepository } from "../../repositories/asset.repository"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"

@CommandHandler(CreateAssetCommand)
export class CreateAssetCommandHandler implements ICommandHandler<CreateAssetCommand> {
  constructor(private readonly repository: AssetRepository) {}

  async execute(command: CreateAssetCommand) {
    const { userId, dto } = command
    const { assetgroupId, ...otherFields } = dto.data
    return await this.repository.create({
      userId: createOrConvertObjectId(userId),
      assetgroupId: createOrConvertObjectId(assetgroupId),
      ...otherFields,
    })
  }
}
