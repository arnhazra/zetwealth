import { IQueryHandler, QueryHandler } from "@nestjs/cqrs"
import { FindAssetsByUserQuery } from "../impl/find-assets-by-user.query"
import { AssetRepository } from "../../repositories/asset.repository"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"

@QueryHandler(FindAssetsByUserQuery)
export class FindAssetsByUserQueryHandler implements IQueryHandler<FindAssetsByUserQuery> {
  constructor(private readonly repository: AssetRepository) {}

  async execute(query: FindAssetsByUserQuery) {
    const { userId } = query
    return await this.repository.find({
      userId: createOrConvertObjectId(userId),
    })
  }
}
