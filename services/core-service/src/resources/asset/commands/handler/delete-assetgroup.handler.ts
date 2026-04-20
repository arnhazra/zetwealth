import { ICommandHandler, CommandHandler } from "@nestjs/cqrs"
import { DeleteAssetGroupCommand } from "../impl/delete-assetgroup.command"
import { AssetGroupRepository } from "../../../asset/repositories/assetgroup.repository"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"

@CommandHandler(DeleteAssetGroupCommand)
export class DeleteAssetGroupCommandHandler implements ICommandHandler<DeleteAssetGroupCommand> {
  constructor(private readonly repository: AssetGroupRepository) {}

  async execute(command: DeleteAssetGroupCommand) {
    const { assetgroupId } = command
    return await this.repository.delete({
      _id: createOrConvertObjectId(assetgroupId),
    })
  }
}
