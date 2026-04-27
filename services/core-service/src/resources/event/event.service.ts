import { Injectable } from "@nestjs/common"
import { statusMessages } from "@/shared/constants/status-messages"
import { CommandBus, QueryBus } from "@nestjs/cqrs"
import { Event } from "./schemas/event.schema"
import { DeleteEventCommand } from "./commands/impl/delete-event.command"
import { CreateEventCommand } from "./commands/impl/create-event.command"
import {
  CreateEventRequestDto,
  CreateEventServiceSchema,
} from "./dto/request/create-event.request.dto"
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
import { AgentTool } from "@/intelligence/agent/agent.decorator"
import { z } from "zod"
import { CalendarEvent } from "./dto/response/event-response.dto"
import { FindEventByMonthServiceSchema } from "./dto/request/find-event.request.dto"

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

  @AgentTool({
    name: "create_event",
    description: "Create a new event for a user",
    schema: CreateEventServiceSchema,
  })
  async createEvent(dto: z.output<typeof CreateEventServiceSchema>) {
    try {
      const { userId, ...rest } = dto
      return await this.commandBus.execute<CreateEventCommand, Event>(
        new CreateEventCommand(userId, { ...rest })
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  @AgentTool({
    name: "get_events_by_month",
    description: "List down events for an user for any given month",
    schema: FindEventByMonthServiceSchema,
  })
  async findMyEventsByMonth(
    dto: z.output<typeof FindEventByMonthServiceSchema>
  ) {
    try {
      const { userId, eventMonth } = dto
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

      const customEvents: CalendarEvent[] = events.map((event) => ({
        _id: String(event._id),
        eventDate: event.eventDate,
        eventName: event.eventName,
        userId: String(event.userId),
        createdAt: (event as any).createdAt,
        eventSource: "Custom",
      }))

      const user = await this.authService.findUserById(userId)
      const assets = await this.assetService.findAllMyAssets({ userId })
      const assetStartDateEvents: CalendarEvent[] = assets.map((asset) => {
        if (asset.startDate) {
          return {
            _id: asset._id,
            eventDate: asset.startDate,
            eventName: `Start date of asset - ${asset.assetName}`,
            userId: asset.userId,
            createdAt: (asset as any).createdAt,
            eventSource: "Asset",
          }
        }
      })

      const assetMaturityDateEvents: CalendarEvent[] = assets.map((asset) => {
        if (asset.maturityDate) {
          return {
            _id: asset._id,
            eventDate: asset.maturityDate,
            eventName: `Maturity date of asset - ${asset.assetName}`,
            userId: asset.userId,
            createdAt: (asset as any).createdAt,
            eventSource: "Asset",
          }
        }
      })

      const goals = await this.goalService.findMyGoals({ userId })

      const goalEvents: CalendarEvent[] = goals.map((goal) => ({
        _id: String(goal._id),
        eventDate: goal.goalDate,
        eventName: `Goal of ${formatCurrency(goal.goalAmount, user.baseCurrency)}`,
        userId: String(goal.userId),
        createdAt: (goal as any).createdAt,
        eventSource: "Goal",
      }))

      const debts = await this.debtService.findMyDebts({ userId })

      const debtStartEvents: CalendarEvent[] = debts.map((debt) => ({
        _id: String(debt._id),
        eventDate: debt.startDate,
        eventName: `Start date of debt - ${debt.debtPurpose}`,
        userId: String(debt.userId),
        createdAt: (debt as any).createdAt,
        eventSource: "Debt",
      }))

      const debtEndEvents: CalendarEvent[] = debts.map((debt) => ({
        _id: String(debt._id),
        eventDate: debt.endDate,
        eventName: `End date of Debt - ${debt.debtPurpose}`,
        userId: String(debt.userId),
        createdAt: (debt as any).createdAt,
        eventSource: "Debt",
      }))

      const nextEmiDateEvents: CalendarEvent[] = debts.map((debt) => ({
        _id: String(debt._id),
        eventDate: (debt as any).nextEmiDate,
        eventName: `EMI date for debt - ${debt.debtPurpose}`,
        userId: String(debt.userId),
        createdAt: (debt as any).createdAt,
        eventSource: "Debt",
      }))

      const cashflows = await this.cashFlowService.findMyCashflows({ userId })
      const cashflowEvents: CalendarEvent[] = cashflows.map((cashflow) => ({
        _id: String(cashflow._id),
        eventDate: cashflow.nextExecutionAt,
        eventName: cashflow.description,
        userId: String(cashflow.userId),
        createdAt: (cashflow as any).createdAt,
        eventSource: "Cashflow",
      }))

      const expenses = await this.expenseService.findMyExpenses({ userId })
      const expensesEvents: CalendarEvent[] = expenses.expenses.map(
        (expense: Expense) => {
          const expenseCategoryDisplayName =
            parsedExpenseCategories.expenseCategories.find(
              (cat) => cat.value === expense.expenseCategory
            ).displayName

          return {
            _id: expense._id,
            eventDate: expense.expenseDate,
            eventName: `Expense of ${formatCurrency(expense.expenseAmount, user.baseCurrency)} for ${expenseCategoryDisplayName}`,
            userId: expense.userId,
            createdAt: (expense as any).createdAt,
            eventSource: "Expense",
          }
        }
      )

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
      ]
        .filter((event) => !!event)
        .filter((event) => {
          if (!event.eventDate) return
          return new Date(event.eventDate).toISOString().startsWith(eventMonth)
        })

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
