import { Module } from "@nestjs/common"
import { config } from "@/config"
import { DbConnectionMap } from "@/shared/entity/entity-db-connection.map"
import { EntityModule } from "@/shared/entity/entity.module"
import { ConfigModule } from "./config/config.module"
import { IntelligenceModule } from "./intelligence/intelligence.module"
import { WidgetModule } from "./widget/widget.module"
import { SubscriptionModule } from "./subscription/subscription.module"

@Module({
  imports: [
    EntityModule.forRoot(
      config.AZURE_COSMOS_DB_CONNECTION_STRING,
      DbConnectionMap.Platform
    ),
    ConfigModule,
    IntelligenceModule,
    WidgetModule,
    SubscriptionModule,
  ],
})
export class PlatformModule {}
