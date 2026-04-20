import { IQueryHandler, QueryHandler } from "@nestjs/cqrs"
import { FindAssetsByTypesQuery } from "../impl/find-assets-by-types.query"
import { AssetRepository } from "../../repositories/asset.repository"
import {
  createOrConvertObjectId,
  QueryFilter,
} from "@/shared/entity/entity.schema"
import { Asset } from "../../schemas/asset.schema"

@QueryHandler(FindAssetsByTypesQuery)
export class FindAssetsByTypesQueryHandler implements IQueryHandler<FindAssetsByTypesQuery> {
  constructor(private readonly repository: AssetRepository) {}

  async execute(query: FindAssetsByTypesQuery) {
    const { userId, assetTypes } = query

    const filter: QueryFilter<Asset> = {
      userId: createOrConvertObjectId(userId),
      assetType: { $in: assetTypes },
    }

    return await this.repository.find(filter)
  }
}
