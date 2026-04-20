import { ICommandHandler, CommandHandler } from "@nestjs/cqrs"
import { AssetGroupRepository } from "../../../asset/repositories/assetgroup.repository"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"
import { UpdateAssetGroupCommand } from "../impl/update-assetgroup.command"

@CommandHandler(UpdateAssetGroupCommand)
export class UpdateAssetGroupCommandHandler implements ICommandHandler<UpdateAssetGroupCommand> {
  constructor(private readonly repository: AssetGroupRepository) {}

  async execute(command: UpdateAssetGroupCommand) {
    const {
      assetgroupId,
      dto: { assetgroupName },
    } = command
    return await this.repository.update(
      { _id: createOrConvertObjectId(assetgroupId) },
      {
        assetgroupName,
      }
    )
  }
}
