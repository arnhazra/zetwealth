export class FindAssetGroupByIdQuery {
  constructor(
    public readonly userId: string,
    public readonly assetgroupId: string
  ) {}
}
