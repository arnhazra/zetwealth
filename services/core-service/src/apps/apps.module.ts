import { Module } from "@nestjs/common"
import { AssetManagerModule } from "./assetmanager/assetmanager.module"
import { DebtTrackModule } from "./debttrack/debttrack.module"
import { GoalManagerModule } from "./goalmanager/goalmanager.module"
import { DiscoverModule } from "./discover/discover.module"
import { ExpenseTrackModule } from "./expensetrack/expensetrack.module"
import { TaxAdvisorModule } from "./taxadvisor/taxadvisor.module"
import { CashFlowModule } from "./cashflow/cashflow.module"
import { CalendarModule } from "./calendar/calendar.module"

@Module({
  imports: [
    AssetManagerModule,
    DebtTrackModule,
    ExpenseTrackModule,
    GoalManagerModule,
    DiscoverModule,
    TaxAdvisorModule,
    CashFlowModule,
    CalendarModule,
  ],
})
export class AppsModule {}
