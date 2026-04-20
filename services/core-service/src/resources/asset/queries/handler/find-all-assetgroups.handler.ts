import { IQueryHandler, QueryHandler } from "@nestjs/cqrs"
import { FindAllAssetGroupQuery } from "../impl/find-all-assetgroups.query"
import { AssetGroupRepository } from "../../../asset/repositories/assetgroup.repository"
import {
  createOrConvertObjectId,
  QueryFilter,
} from "@/shared/entity/entity.schema"
import { AssetGroup } from "../../../asset/schemas/assetgroup.schema"

@QueryHandler(FindAllAssetGroupQuery)
export class FindAllAssetGroupQueryHandler implements IQueryHandler<FindAllAssetGroupQuery> {
  constructor(private readonly repository: AssetGroupRepository) {}

  async execute(query: FindAllAssetGroupQuery) {
    const { userId, searchKeyword } = query

    const filter: QueryFilter<AssetGroup> = {
      userId: createOrConvertObjectId(userId),
    }

    if (searchKeyword && searchKeyword.trim().length > 0) {
      filter.assetgroupName = { $regex: new RegExp(searchKeyword, "i") }
    }

    return await this.repository.find(filter).sort({ assetgroupName: 1 })
  }
}
