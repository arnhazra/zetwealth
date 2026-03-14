import { Module } from "@nestjs/common"
import { AssetModule } from "./asset/asset.module"
import { AssetGroupModule } from "./assetgroup/assetgroup.module"
import { EntityModule } from "@/shared/entity/entity.module"
import { config } from "@/config"
import { AppsDbConnectionMap } from "@/shared/entity/entity-db-connection.map"

@Module({
  imports: [
    EntityModule.forRoot(
      config.AZURE_COSMOS_DB_CONNECTION_STRING,
      AppsDbConnectionMap.AssetManager
    ),
    AssetGroupModule,
    AssetModule,
  ],
})
export class AssetManagerModule {}
