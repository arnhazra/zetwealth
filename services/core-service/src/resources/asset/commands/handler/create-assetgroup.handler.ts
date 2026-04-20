import { ICommandHandler, CommandHandler } from "@nestjs/cqrs"
import { CreateAssetGroupCommand } from "../impl/create-assetgroup.command"
import { AssetGroupRepository } from "../../../asset/repositories/assetgroup.repository"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"

@CommandHandler(CreateAssetGroupCommand)
export class CreateAssetGroupCommandHandler implements ICommandHandler<CreateAssetGroupCommand> {
  constructor(private readonly repository: AssetGroupRepository) {}

  async execute(command: CreateAssetGroupCommand) {
    const {
      userId,
      dto: { assetgroupName },
    } = command
    return await this.repository.create({
      userId: createOrConvertObjectId(userId),
      assetgroupName,
    })
  }
}
