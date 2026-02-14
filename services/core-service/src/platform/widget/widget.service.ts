import { User } from "@/auth/schemas/user.schema"
import { AppEventMap } from "@/shared/constants/app-events.map"
import { Injectable } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { formatCurrency } from "./lib/format-currency"
import { format } from "date-fns"

@Injectable()
export class WidgetService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

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

      const widgets = [
        {
          icon: "Banknote",
          title: "Total Assets",
          value: formatCurrency(Number(assetData), user.baseCurrency),
          additionalInfo: "Sum of all assets",
        },
        {
          icon: "HandCoins",
          title: "Current Month Expense",
          value: formatCurrency(Number(expenseData.total), user.baseCurrency),
          additionalInfo: `Expense for ${format(new Date(), "MMM, yyyy")}`,
        },
        {
          icon: "GoalIcon",
          title: "Goal Progress",
          value: formatCurrency(
            Number(goalData ? goalData?.goalAmount : 0),
            user.baseCurrency
          ),
          additionalInfo: `${goalPercentage >= 100 ? 100 : goalPercentage.toFixed(0)}% Complete`,
        },
        {
          icon: "CreditCard",
          title: "Current Liabilities",
          value: formatCurrency(
            Number(debtData.remainingDebt),
            user.baseCurrency
          ),
          additionalInfo: `EMI is ${formatCurrency(debtData.totalEMI, user.baseCurrency)}`,
        },
      ]
      return widgets
    } catch (error) {
      throw error
    }
  }
}
