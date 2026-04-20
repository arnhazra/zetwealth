import { Injectable } from "@nestjs/common"
import { Asset } from "../schemas/asset.schema"
import { DbConnectionMap } from "@/shared/entity/entity-db-connection.map"
import {
  EntityModel,
  EntityRepository,
  InjectEntityModel,
} from "@/shared/entity/entity.repository"

@Injectable()
export class AssetRepository extends EntityRepository<Asset> {
  constructor(
    @InjectEntityModel(Asset.name, DbConnectionMap.Resource)
    private assetModel: EntityModel<Asset>
  ) {
    super(assetModel)
  }
}
