import { Injectable } from "@nestjs/common"
import { statusMessages } from "@/shared/constants/status-messages"
import { CommandBus, QueryBus } from "@nestjs/cqrs"
import { Event } from "./schemas/event.schema"
import { DeleteEventCommand } from "./commands/impl/delete-event.command"
import { CreateEventCommand } from "./commands/impl/create-event.command"
import { CreateEventRequestDto } from "./dto/request/create-event.request.dto"
import { FindEventsByUserQuery } from "./queries/impl/find-event-by-user.query"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { AppEventMap } from "@/shared/constants/app-events.map"
import { Asset } from "@/apps/assetmanager/asset/schemas/asset.schema"
import { Goal } from "@/apps/goalmanager/schemas/goal.schema"
import { Debt } from "@/apps/debttrack/schemas/debt.schema"
import { Cashflow } from "@/apps/cashflow/schemas/cashflow.schema"
import { Expense } from "@/apps/expensetrack/schemas/expense.schema"
import { User } from "@/auth/schemas/user.schema"
import { formatCurrency } from "@/platform/widget/lib/format-currency"
import { RedisService } from "@/shared/redis/redis.service"
import { ExpenseCategoryConfig } from "@/shared/constants/types"

@Injectable()
export class EventService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly eventEmitter: EventEmitter2,
    private readonly redisService: RedisService
  ) {}

  async createEvent(userId: string, requestBody: CreateEventRequestDto) {
    try {
      return await this.commandBus.execute<CreateEventCommand, Event>(
        new CreateEventCommand(userId, requestBody)
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async findMyEventsByMonth(userId: string, selectedMonth: string) {
    try {
      const events = await this.queryBus.execute<
        FindEventsByUserQuery,
        Event[]
      >(new FindEventsByUserQuery(userId))
      const expenseCategoryConfig = await this.redisService.get(
        "expense-category-config"
      )

      const parsedExpenseCategories: ExpenseCategoryConfig = JSON.parse(
        expenseCategoryConfig
      )

      const customEvents = events.map((event) => ({
        ...event,
        eventSource: "Custom",
      }))

      const user: User = (
        await this.eventEmitter.emitAsync(AppEventMap.GetUserDetails, userId)
      ).shift()

      const assets: Asset[] = (
        await this.eventEmitter.emitAsync(AppEventMap.GetAssetList, userId)
      ).shift()
      const assetStartDateEvents = assets.map((asset) => {
        if (asset.startDate) {
          return {
            eventDate: asset.startDate,
            eventName: `Start date of asset - ${asset.assetName}`,
            userId: asset.userId,
            createdAt: (asset as any).createdAt,
            _id: asset._id,
            eventSource: "Asset",
          }
        }
      })

      const assetMaturityDateEvents = assets.map((asset) => {
        if (asset.maturityDate) {
          return {
            eventDate: asset.maturityDate,
            eventName: `Maturity date of asset - ${asset.assetName}`,
            userId: asset.userId,
            createdAt: (asset as any).createdAt,
            _id: asset._id,
            eventSource: "Asset",
          }
        }
      })

      const goals: Goal[] = (
        await this.eventEmitter.emitAsync(AppEventMap.GetGoalList, userId)
      ).shift()

      const goalEvents = goals.map((goal) => ({
        eventDate: goal.goalDate,
        eventName: `Goal of ${formatCurrency(goal.goalAmount, user.baseCurrency)}`,
        userId: goal.userId,
        createdAt: (goal as any).createdAt,
        _id: goal._id,
        eventSource: "Goal",
      }))

      const debts: Debt[] = (
        await this.eventEmitter.emitAsync(AppEventMap.GetDebtList, userId)
      ).shift()

      const debtStartEvents = debts.map((debt) => ({
        eventDate: debt.startDate,
        eventName: `Start date of debt - ${debt.debtPurpose}`,
        userId: debt.userId,
        createdAt: (debt as any).createdAt,
        _id: debt._id,
        eventSource: "Debt",
      }))

      const debtEndEvents = debts.map((debt) => ({
        eventDate: debt.endDate,
        eventName: `End date of Debt - ${debt.debtPurpose}`,
        userId: debt.userId,
        createdAt: (debt as any).createdAt,
        _id: debt._id,
        eventSource: "Debt",
      }))

      const nextEmiDateEvents = debts.map((debt) => ({
        eventDate: (debt as any).nextEmiDate,
        eventName: `EMI date for debt - ${debt.debtPurpose}`,
        userId: debt.userId,
        createdAt: (debt as any).createdAt,
        _id: debt._id,
        eventSource: "Debt",
      }))

      const cashflows: Cashflow[] = (
        await this.eventEmitter.emitAsync(
          AppEventMap.FindCashFlowsByUserId,
          userId
        )
      ).shift()
      const cashflowEvents = cashflows.map((cashflow) => ({
        eventDate: cashflow.nextExecutionAt,
        eventName: cashflow.description,
        userId: cashflow.userId,
        createdAt: (cashflow as any).createdAt,
        _id: cashflow._id,
        eventSource: "Cashflow",
      }))

      const expenses = (
        await this.eventEmitter.emitAsync(
          AppEventMap.GetExpenseByMonth,
          userId,
          selectedMonth
        )
      ).shift()
      const expensesEvents = expenses.expenses.map((expense: Expense) => {
        const expenseCategoryDisplayName =
          parsedExpenseCategories.expenseCategories.find(
            (cat) => cat.value === expense.expenseCategory
          ).displayName

        return {
          eventDate: expense.expenseDate,
          eventName: `Expense of ${formatCurrency(expense.expenseAmount, user.baseCurrency)} for ${expenseCategoryDisplayName}`,
          userId: expense.userId,
          createdAt: (expense as any).createdAt,
          _id: expense._id,
          eventSource: "Expense",
        }
      })

      const allEvents = [
        ...customEvents,
        ...cashflowEvents,
        ...goalEvents,
        ...debtStartEvents,
        ...debtEndEvents,
        ...nextEmiDateEvents,
        ...assetStartDateEvents,
        ...assetMaturityDateEvents,
        ...expensesEvents,
      ].filter((event) => !!event)

      return allEvents
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async deleteEvent(reqUserId: string, eventId: string) {
    try {
      await this.commandBus.execute(new DeleteEventCommand(eventId))
      return { success: true }
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }
}
