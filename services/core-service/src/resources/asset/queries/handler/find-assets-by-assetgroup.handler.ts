import { IQueryHandler, QueryHandler } from "@nestjs/cqrs"
import { FindAssetsByAssetGroupQuery } from "../impl/find-assets-by-assetgroup.query"
import { AssetRepository } from "../../repositories/asset.repository"
import {
  createOrConvertObjectId,
  QueryFilter,
} from "@/shared/entity/entity.schema"
import { Asset } from "../../schemas/asset.schema"

@QueryHandler(FindAssetsByAssetGroupQuery)
export class FindAssetsByAssetGroupQueryHandler implements IQueryHandler<FindAssetsByAssetGroupQuery> {
  constructor(private readonly repository: AssetRepository) {}

  async execute(query: FindAssetsByAssetGroupQuery) {
    const { userId, assetgroupId, searchKeyword } = query

    const filter: QueryFilter<Asset> = {
      userId: createOrConvertObjectId(userId),
      assetgroupId: createOrConvertObjectId(assetgroupId),
    }

    if (searchKeyword && searchKeyword.trim().length > 0) {
      filter.assetName = { $regex: new RegExp(searchKeyword, "i") }
    }

    return await this.repository.find(filter).sort({ assetName: 1 })
  }
}
