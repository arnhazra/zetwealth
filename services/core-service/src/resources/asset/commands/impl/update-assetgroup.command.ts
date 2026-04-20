import { CreateAssetGroupRequestDto } from "../../dto/request/create-assetgroup.request.dto"

export class UpdateAssetGroupCommand {
  constructor(
    public readonly userId: string,
    public readonly assetgroupId: string,
    public readonly dto: CreateAssetGroupRequestDto
  ) {}
}
