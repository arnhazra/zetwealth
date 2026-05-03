import { Injectable } from "@nestjs/common"
import { formatCurrency } from "./lib/format-currency"
import { format } from "date-fns"
import { ConfigService } from "../config/config.service"
import { AuthService } from "@/auth/auth.service"
import { AssetService } from "@/resources/asset/asset.service"
import { DebtService } from "@/resources/debt/debt.service"
import { GoalService } from "@/resources/goal/goal.service"
import { ExpenseService } from "@/resources/expense/expense.service"

@Injectable()
export class WidgetService {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly assetService: AssetService,
    private readonly debtService: DebtService,
    private readonly goalService: GoalService,
    private readonly expenseService: ExpenseService
  ) {}

  async getWidgets(userId: string) {
    try {
      const user = await this.authService.findUserById(userId)
      const assetData = await this.assetService.calculateTotalAssetValuation({
        userId,
      })
      const debtData = await this.debtService.calculateTotalDebt({ userId })
      const goalData = await this.goalService.findNearestGoal({ userId })
      const expenseData = await this.expenseService.findAllByUserId({ userId })

      const goalPercentage =
        ((assetData ?? 0) * 100) / (goalData ? goalData?.goalAmount : 0) || 0

      const widgetConfig = await this.configService.getConfig("widget-config")
      const stringifiedWidgetConfig = JSON.stringify(widgetConfig)

      const widgets = stringifiedWidgetConfig
        .replaceAll(
          "{ASSET_VALUE}",
          formatCurrency(Number(assetData), user.baseCurrency)
        )
        .replaceAll(
          "{EXPENSE_VALUE}",
          formatCurrency(Number(expenseData.total), user.baseCurrency)
        )
        .replaceAll("{MONTH_YEAR}", `${format(new Date(), "MMM, yyyy")}`)
        .replaceAll(
          "{GOAL_AMOUNT}",
          formatCurrency(
            Number(goalData ? goalData?.goalAmount : 0),
            user.baseCurrency
          )
        )
        .replaceAll(
          "{GOAL_PERCENTAGE}",
          `${goalPercentage >= 100 ? 100 : goalPercentage.toFixed(0)}`
        )
        .replaceAll(
          "{REMAINING_DEBT}",
          formatCurrency(Number(debtData.remainingDebt), user.baseCurrency)
        )
        .replaceAll(
          "{TOTAL_EMI}",
          formatCurrency(debtData.totalEMI, user.baseCurrency)
        )

      return JSON.parse(widgets).widgets
    } catch (error) {
      throw error
    }
  }
}
