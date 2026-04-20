import { IsNotEmpty } from "class-validator"

export class CreateAssetGroupRequestDto {
  @IsNotEmpty()
  assetgroupName: string
}
