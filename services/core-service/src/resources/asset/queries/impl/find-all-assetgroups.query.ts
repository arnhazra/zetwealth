export class FindAllAssetGroupQuery {
  constructor(
    public readonly userId: string,
    public readonly searchKeyword?: string
  ) {}
}
