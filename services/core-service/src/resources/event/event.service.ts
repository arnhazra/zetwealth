import { Injectable } from "@nestjs/common"
import { statusMessages } from "@/shared/constants/status-messages"
import { CommandBus, QueryBus } from "@nestjs/cqrs"
import { Event } from "./schemas/event.schema"
import { DeleteEventCommand } from "./commands/impl/delete-event.command"
import { CreateEventCommand } from "./commands/impl/create-event.command"
import { CreateEventRequestDto } from "./dto/request/create-event.request.dto"
import { FindEventsByUserQuery } from "./queries/impl/find-event-by-user.query"
import { Expense } from "@/resources/expense/schemas/expense.schema"
import { formatCurrency } from "@/platform/widget/lib/format-currency"
import { ExpenseCategoryConfig } from "@/shared/constants/types"
import { ConfigService } from "@/platform/config/config.service"
import { UpdateEventCommand } from "./commands/impl/update-event.command"
import { FindEventByIdQuery } from "./queries/impl/find-event-by-id.query"
import { AuthService } from "@/auth/auth.service"
import { AssetService } from "../asset/asset.service"
import { DebtService } from "../debt/debt.service"
import { ExpenseService } from "../expense/expense.service"
import { GoalService } from "../goal/goal.service"
import { CashFlowService } from "../cashflow/cashflow.service"

@Injectable()
export class EventService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly assetService: AssetService,
    private readonly debtService: DebtService,
    private readonly goalService: GoalService,
    private readonly cashFlowService: CashFlowService,
    private readonly expenseService: ExpenseService
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
      const expenseCategoryConfig = await this.configService.getConfig(
        "expense-category-config"
      )

      const parsedExpenseCategories: ExpenseCategoryConfig = JSON.parse(
        JSON.stringify(expenseCategoryConfig)
      )

      const customEvents = events.map((event) => ({
        ...event,
        eventSource: "Custom",
      }))

      const user = await this.authService.findUserById(userId)
      const assets = await this.assetService.findAllMyAssets(userId)
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

      const goals = await this.goalService.findMyGoals(userId)

      const goalEvents = goals.map((goal) => ({
        eventDate: goal.goalDate,
        eventName: `Goal of ${formatCurrency(goal.goalAmount, user.baseCurrency)}`,
        userId: goal.userId,
        createdAt: (goal as any).createdAt,
        _id: goal._id,
        eventSource: "Goal",
      }))

      const debts = await this.debtService.findMyDebts(userId)

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

      const cashflows = await this.cashFlowService.findMyCashflows(userId)
      const cashflowEvents = cashflows.map((cashflow) => ({
        eventDate: cashflow.nextExecutionAt,
        eventName: cashflow.description,
        userId: cashflow.userId,
        createdAt: (cashflow as any).createdAt,
        _id: cashflow._id,
        eventSource: "Cashflow",
      }))

      const expenses = await this.expenseService.findMyExpenses(userId)
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

  async findById(userId: string, eventId: string) {
    try {
      const result = await this.queryBus.execute(
        new FindEventByIdQuery(userId, eventId)
      )
      return result
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async updateById(
    userId: string,
    eventId: string,
    dto: CreateEventRequestDto
  ) {
    try {
      const result = await this.commandBus.execute(
        new UpdateEventCommand(userId, eventId, dto)
      )
      return result
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
