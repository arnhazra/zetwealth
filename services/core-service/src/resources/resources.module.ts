import { Module } from "@nestjs/common"
import { DebtModule } from "./debt/debt.module"
import { GoalModule } from "./goal/goal.module"
import { ExpenseModule } from "./expense/expense.module"
import { CashFlowModule } from "./cashflow/cashflow.module"
import { EventModule } from "./event/event.module"
import { EntityModule } from "@/shared/entity/entity.module"
import { config } from "@/config"
import { DbConnectionMap } from "@/shared/entity/entity-db-connection.map"
import { AssetModule } from "./asset/asset.module"

@Module({
  imports: [
    EntityModule.forRoot(
      config.AZURE_COSMOS_DB_CONNECTION_STRING,
      DbConnectionMap.Resource
    ),
    AssetModule,
    CashFlowModule,
    DebtModule,
    ExpenseModule,
    EventModule,
    GoalModule,
  ],
})
export class ResourceModule {}
