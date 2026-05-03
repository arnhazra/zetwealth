import { IQueryHandler, QueryHandler } from "@nestjs/cqrs"
import { FindAssetGroupByIdQuery } from "../impl/find-assetgroup-by-id.query"
import { AssetGroupRepository } from "../../../asset/repositories/assetgroup.repository"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"

@QueryHandler(FindAssetGroupByIdQuery)
export class FindAssetGroupByIdQueryHandler implements IQueryHandler<FindAssetGroupByIdQuery> {
  constructor(private readonly repository: AssetGroupRepository) {}

  async execute(query: FindAssetGroupByIdQuery) {
    const { assetgroupId } = query
    return await this.repository.findOne({
      _id: createOrConvertObjectId(assetgroupId),
    })
  }
}
