import { Module } from "@nestjs/common"
import { EntityModule } from "@/shared/entity/entity.module"
import { DbConnectionMap } from "@/shared/entity/entity-db-connection.map"
import { CashFlowService } from "./cashflow.service"
import { CashFlowController } from "./cashflow.controller"
import { CqrsModule } from "@nestjs/cqrs"
import { Cashflow, CashflowSchema } from "./schemas/cashflow.schema"
import { CashFlowRepository } from "./cashflow.repository"
import { CreateCashflowCommandHandler } from "./commands/handler/create-cashflow.handler"
import { DeleteCashflowCommandHandler } from "./commands/handler/delete-cashflow.handler"
import { FindCashflowsByDayQueryHandler } from "./queries/handler/find-cashflows-by-day.handler"
import { FindCashflowsByUserQueryHandler } from "./queries/handler/find-cashflows-by-user.handler"
import { FindCashflowByIdHandler } from "./queries/handler/find-cashflow-by-id.handler"
import { UpdateCashflowHandler } from "./commands/handler/update-cashflow.handler"
import { AssetModule } from "../asset/asset.module"

@Module({
  imports: [
    CqrsModule,
    AssetModule,
    EntityModule.forFeature(
      [{ name: Cashflow.name, schema: CashflowSchema }],
      DbConnectionMap.Resource
    ),
  ],
  controllers: [CashFlowController],
  providers: [
    CashFlowService,
    CashFlowRepository,
    CreateCashflowCommandHandler,
    DeleteCashflowCommandHandler,
    FindCashflowsByDayQueryHandler,
    FindCashflowsByUserQueryHandler,
    FindCashflowByIdHandler,
    UpdateCashflowHandler,
  ],
  exports: [CashFlowService],
})
export class CashFlowModule {}
