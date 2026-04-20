import { IQueryHandler, QueryHandler } from "@nestjs/cqrs"
import { FindAssetByIdQuery } from "../impl/find-asset-by-id.query"
import { AssetRepository } from "../../repositories/asset.repository"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"

@QueryHandler(FindAssetByIdQuery)
export class FindAssetByIdQueryHandler implements IQueryHandler<FindAssetByIdQuery> {
  constructor(private readonly repository: AssetRepository) {}

  async execute(query: FindAssetByIdQuery) {
    const { assetId, userId } = query
    return await this.repository.findOne({
      _id: createOrConvertObjectId(assetId),
      userId: createOrConvertObjectId(userId),
    })
  }
}
