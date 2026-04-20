import { Module } from "@nestjs/common"
import { IntelligenceService } from "./intelligence.service"
import { IntelligenceController } from "./intelligence.controller"
import { CqrsModule } from "@nestjs/cqrs"
import { DbConnectionMap } from "@/shared/entity/entity-db-connection.map"
import { Thread, ThreadSchema } from "./schemas/thread.schema"
import { CreateThreadCommandHandler } from "./commands/handler/create-thread.handler"
import { IntelligenceRepository } from "./intelligence.repository"
import { EntityModule } from "@/shared/entity/entity.module"
import { FetchThreadByIdQueryHandler } from "./queries/handler/fetch-thread-by-id.handler"
import { HttpModule } from "@nestjs/axios"
import { ChatStrategy } from "./strategies/chat.strategy"
import { AuthModule } from "@/auth/auth.module"
import { AssetModule } from "@/resources/asset/asset.module"
import { CashFlowModule } from "@/resources/cashflow/cashflow.module"
import { DebtModule } from "@/resources/debt/debt.module"
import { GoalModule } from "@/resources/goal/goal.module"
import { EventModule } from "@/resources/event/event.module"
import { ExpenseModule } from "@/resources/expense/expense.module"

@Module({
  imports: [
    HttpModule,
    CqrsModule,
    AuthModule,
    AssetModule,
    CashFlowModule,
    DebtModule,
    GoalModule,
    EventModule,
    ExpenseModule,
    EntityModule.forFeature(
      [{ name: Thread.name, schema: ThreadSchema }],
      DbConnectionMap.Platform
    ),
  ],
  controllers: [IntelligenceController],
  providers: [
    IntelligenceService,
    IntelligenceRepository,
    ChatStrategy,
    CreateThreadCommandHandler,
    FetchThreadByIdQueryHandler,
  ],
})
export class IntelligenceModule {}
