import { Injectable } from "@nestjs/common"
import { AssetGroup } from "../schemas/assetgroup.schema"
import { DbConnectionMap } from "@/shared/entity/entity-db-connection.map"
import {
  EntityModel,
  EntityRepository,
  InjectEntityModel,
} from "@/shared/entity/entity.repository"

@Injectable()
export class AssetGroupRepository extends EntityRepository<AssetGroup> {
  constructor(
    @InjectEntityModel(AssetGroup.name, DbConnectionMap.Resource)
    private assetgroupModel: EntityModel<AssetGroup>
  ) {
    super(assetgroupModel)
  }
}
