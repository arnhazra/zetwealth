import { CreateAssetGroupRequestDto } from "../../dto/request/create-assetgroup.request.dto"

export class CreateAssetGroupCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: CreateAssetGroupRequestDto
  ) {}
}
