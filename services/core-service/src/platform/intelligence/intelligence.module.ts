import { Module } from "@nestjs/common"
import { IntelligenceService } from "./intelligence.service"
import { IntelligenceController } from "./intelligence.controller"
import { CqrsModule } from "@nestjs/cqrs"
import { GeneralDbConnectionMap } from "@/shared/entity/entity-db-connection.map"
import { Thread, ThreadSchema } from "./schemas/thread.schema"
import { CreateThreadCommandHandler } from "./commands/handler/create-thread.handler"
import { IntelligenceRepository } from "./intelligence.repository"
import { EntityModule } from "@/shared/entity/entity.module"
import { FetchThreadByIdQueryHandler } from "./queries/handler/fetch-thread-by-id.handler"
import { HttpModule } from "@nestjs/axios"
import { config } from "@/config"
import { ChatStrategy } from "./strategies/chat.strategy"
import { AssetGroupAgent } from "./agents/assetgroup.agent"
import { AssetAgent } from "./agents/asset.agent"
import { GoalAgent } from "./agents/goal.agent"
import { DebtAgent } from "./agents/debt.agent"
import { ExpenseAgent } from "./agents/expense.agent"
import { CashflowAgent } from "./agents/cashflow.agent"

@Module({
  imports: [
    HttpModule,
    CqrsModule,
    EntityModule.forRoot(
      config.AZURE_COSMOS_DB_CONNECTION_STRING,
      GeneralDbConnectionMap.Platform
    ),
    EntityModule.forFeature(
      [{ name: Thread.name, schema: ThreadSchema }],
      GeneralDbConnectionMap.Platform
    ),
  ],
  controllers: [IntelligenceController],
  providers: [
    IntelligenceService,
    IntelligenceRepository,
    ChatStrategy,
    AssetGroupAgent,
    AssetAgent,
    GoalAgent,
    DebtAgent,
    ExpenseAgent,
    CashflowAgent,
    CreateThreadCommandHandler,
    FetchThreadByIdQueryHandler,
  ],
})
export class IntelligenceModule {}
