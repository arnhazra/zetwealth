import { ICommandHandler, CommandHandler } from "@nestjs/cqrs"
import { AssetRepository } from "../../repositories/asset.repository"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"
import { UpdateAssetCommand } from "../impl/update-asset.command"

@CommandHandler(UpdateAssetCommand)
export class UpdateAssetCommandHandler implements ICommandHandler<UpdateAssetCommand> {
  constructor(private readonly repository: AssetRepository) {}

  async execute(command: UpdateAssetCommand) {
    const { assetId, dto } = command
    const { assetgroupId, ...otherFields } = dto.data
    return await this.repository.update(
      { _id: createOrConvertObjectId(assetId) },
      {
        assetgroupId: createOrConvertObjectId(assetgroupId),
        ...otherFields,
      }
    )
  }
}
