import { Module } from "@nestjs/common"
import { EntityModule } from "@/shared/entity/entity.module"
import { config } from "@/config"
import { AppsDbConnectionMap } from "@/shared/entity/entity-db-connection.map"
import { CashFlowService } from "./cashflow.service"
import { CashFlowController } from "./cashflow.controller"
import { CqrsModule } from "@nestjs/cqrs"
import { Cashflow, CashflowSchema } from "./schemas/cashflow.schema"
import { CashFlowRepository } from "./cashflow.repository"

import { CreateCashflowCommandHandler } from "./commands/handler/create-cashflow.handler"
import { DeleteCashflowCommandHandler } from "./commands/handler/delete-cashflow.handler"
import { FindCashflowsQueryHandler } from "./queries/handler/find-cashflows.handler"
import { FindCashflowsByUserQueryHandler } from "./queries/handler/find-cashflows-by-user.handler"
import { FindCashflowByIdHandler } from "./queries/handler/find-cashflow-by-id.handler"
import { UpdateCashflowHandler } from "./commands/handler/update-cashflow.handler"

@Module({
  imports: [
    CqrsModule,
    EntityModule.forRoot(
      config.APPS_DATABASE_URI,
      AppsDbConnectionMap.CashFlow
    ),
    EntityModule.forFeature(
      [{ name: Cashflow.name, schema: CashflowSchema }],
      AppsDbConnectionMap.CashFlow
    ),
  ],
  controllers: [CashFlowController],
  providers: [
    CashFlowService,
    CashFlowRepository,
    CreateCashflowCommandHandler,
    DeleteCashflowCommandHandler,
    FindCashflowsQueryHandler,
    FindCashflowsByUserQueryHandler,
    FindCashflowByIdHandler,
    UpdateCashflowHandler,
  ],
})
export class CashFlowModule {}
