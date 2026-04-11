import { User } from "@/auth/schemas/user.schema"
import { AppEventMap } from "@/shared/constants/app-events.map"
import { Injectable } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { formatCurrency } from "./lib/format-currency"
import { format } from "date-fns"
import { ConfigService } from "../config/config.service"

@Injectable()
export class WidgetService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService
  ) {}

  async getWidgets(userId: string) {
    try {
      const assetData = (
        await this.eventEmitter.emitAsync(AppEventMap.GetTotalAsset, userId)
      ).shift()
      const debtData = (
        await this.eventEmitter.emitAsync(AppEventMap.GetTotalDebt, userId)
      ).shift()
      const goalData = (
        await this.eventEmitter.emitAsync(AppEventMap.GetNearestGoal, userId)
      ).shift()
      const expenseData = (
        await this.eventEmitter.emitAsync(AppEventMap.GetExpenseByMonth, userId)
      ).shift()

      const user: User = (
        await this.eventEmitter.emitAsync(AppEventMap.GetUserDetails, userId)
      ).shift()

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
