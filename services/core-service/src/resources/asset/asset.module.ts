import { Module } from "@nestjs/common"
import { AssetService } from "./asset.service"
import { AssetController } from "./asset.controller"
import { CqrsModule } from "@nestjs/cqrs"
import { Asset, AssetSchema } from "./schemas/asset.schema"
import { DbConnectionMap } from "@/shared/entity/entity-db-connection.map"
import { AssetRepository } from "./repositories/asset.repository"
import { CreateAssetCommandHandler } from "./commands/handler/create-asset.handler"
import { DeleteAssetCommandHandler } from "./commands/handler/delete-asset.handler"
import { FindAssetByIdQueryHandler } from "./queries/handler/find-asset-by-id.handler"
import { EntityModule } from "@/shared/entity/entity.module"
import { UpdateAssetCommandHandler } from "./commands/handler/update-asset.handler"
import { FindAssetsByUserQueryHandler } from "./queries/handler/find-assets-by-user.handler"
import { FindAssetsByAssetGroupQueryHandler } from "./queries/handler/find-assets-by-assetgroup.handler"
import { FindAssetsByTypesQueryHandler } from "./queries/handler/find-assets-by-types.handler"
import { AssetAgent } from "./asset.agent"
import { AssetGroup, AssetGroupSchema } from "./schemas/assetgroup.schema"
import { AssetGroupRepository } from "./repositories/assetgroup.repository"
import { CreateAssetGroupCommandHandler } from "./commands/handler/create-assetgroup.handler"
import { DeleteAssetGroupCommandHandler } from "./commands/handler/delete-assetgroup.handler"
import { FindAllAssetGroupQueryHandler } from "./queries/handler/find-all-assetgroups.handler"
import { FindAssetGroupByIdQueryHandler } from "./queries/handler/find-assetgroup-by-id.handler"
import { UpdateAssetGroupCommandHandler } from "./commands/handler/update-assetgroup.handler"

@Module({
  imports: [
    CqrsModule,
    EntityModule.forFeature(
      [{ name: Asset.name, schema: AssetSchema }],
      DbConnectionMap.Resource
    ),
    EntityModule.forFeature(
      [{ name: AssetGroup.name, schema: AssetGroupSchema }],
      DbConnectionMap.Resource
    ),
  ],
  controllers: [AssetController],
  providers: [
    AssetAgent,
    AssetService,
    AssetRepository,
    CreateAssetCommandHandler,
    UpdateAssetCommandHandler,
    DeleteAssetCommandHandler,
    FindAssetsByAssetGroupQueryHandler,
    FindAssetsByUserQueryHandler,
    FindAssetByIdQueryHandler,
    FindAssetsByTypesQueryHandler,
    AssetGroupRepository,
    CreateAssetGroupCommandHandler,
    UpdateAssetGroupCommandHandler,
    DeleteAssetGroupCommandHandler,
    FindAllAssetGroupQueryHandler,
    FindAssetGroupByIdQueryHandler,
  ],
  exports: [AssetAgent, AssetService],
})
export class AssetModule {}
