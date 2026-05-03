import { AssetType } from "@/shared/constants/types"

export class FindAssetsByTypesQuery {
  constructor(
    public readonly userId: string,
    public readonly assetTypes: AssetType[]
  ) {}
}
