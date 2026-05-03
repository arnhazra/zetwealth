import { Injectable } from "@nestjs/common"
import { statusMessages } from "@/shared/constants/status-messages"
import { CommandBus, QueryBus } from "@nestjs/cqrs"
import { Expense } from "./schemas/expense.schema"
import { DeleteExpenseCommand } from "./commands/impl/delete-expense.command"
import { CreateExpenseCommand } from "./commands/impl/create-expense.command"
import {
  CreateExpenseRequestDto,
  CreateExpenseServiceSchema,
} from "./dto/request/request.dto"
import { UpdateExpenseCommand } from "./commands/impl/update-expense.command"
import { FindExpensesByUserQuery } from "./queries/impl/find-expense-by-user.query"
import { FindExpenseByIdQuery } from "./queries/impl/find-expense-by-id.query"
import { ExpenseCategory } from "@/shared/constants/types"
import { z } from "zod"
import { AgentTool } from "@/intelligence/agent/agent.decorator"
import { FindExpensesByMonthServiceSchema } from "./dto/request/request.dto"
import { assertOwnership } from "@/shared/utils/assert-ownership"

@Injectable()
export class ExpenseService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  @AgentTool({
    name: "list_expense_categories",
    description: "Get expense categories",
    schema: z.object({}),
  })
  public getExpenseCategories() {
    return Object.values(ExpenseCategory)
  }

  @AgentTool({
    name: "create_expense",
    description: "Create a new expense for a user",
    schema: CreateExpenseServiceSchema,
  })
  async create(dto: z.output<typeof CreateExpenseServiceSchema>) {
    try {
      const { userId, ...rest } = dto
      return await this.commandBus.execute<CreateExpenseCommand, Expense>(
        new CreateExpenseCommand(userId, { ...rest })
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  @AgentTool({
    name: "list_expenses_by_month",
    description: "List down expenses for an user for any given month",
    schema: FindExpensesByMonthServiceSchema,
  })
  async findAllByUserId(
    dto: z.output<typeof FindExpensesByMonthServiceSchema>
  ) {
    try {
      const { userId, monthFilter, searchKeyword, expenseCategory } = dto
      return await this.queryBus.execute<FindExpensesByUserQuery>(
        new FindExpensesByUserQuery(
          userId,
          monthFilter,
          searchKeyword,
          expenseCategory
        )
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async findById(userId: string, expenseId: string) {
    try {
      const expense = await this.queryBus.execute<
        FindExpenseByIdQuery,
        Expense
      >(new FindExpenseByIdQuery(expenseId))
      assertOwnership(expense, userId)
      return expense
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async updateById(
    userId: string,
    expenseId: string,
    requestBody: CreateExpenseRequestDto
  ) {
    try {
      await this.findById(userId, expenseId)
      return await this.commandBus.execute<UpdateExpenseCommand, Expense>(
        new UpdateExpenseCommand(userId, expenseId, requestBody)
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async deleteById(userId: string, expenseId: string) {
    try {
      await this.findById(userId, expenseId)
      await this.commandBus.execute(new DeleteExpenseCommand(expenseId))
      return { success: true }
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }
}
