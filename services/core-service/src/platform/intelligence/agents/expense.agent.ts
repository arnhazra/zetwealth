import { ExpenseCategory } from "@/shared/constants/types"
import { AppEventMap } from "@/shared/constants/app-events.map"
import { tool } from "langchain"
import { Injectable } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { z } from "zod"
import { Expense } from "@/resources/expense/schemas/expense.schema"

@Injectable()
export class ExpenseAgent {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  public getExpenseByMonthTool = tool(
    async ({
      userId,
      expenseMonth,
    }: {
      userId: string
      expenseMonth: string
    }) => {
      try {
        const expenses: Expense[] = await this.eventEmitter.emitAsync(
          AppEventMap.GetExpenseByMonth,
          userId,
          expenseMonth
        )

        return JSON.stringify(expenses)
      } catch (error) {
        return "Unable to get the expense list"
      }
    },
    {
      name: "get_expenses_by_month",
      description: "List down expenses for an user for any given month",
      schema: z.object({
        userId: z.string().describe("user id of the user"),
        expenseMonth: z
          .string()
          .describe(
            "calculate month given by the user - format should be like 2022-05"
          ),
      }),
    }
  )

  public createExpenseTool = tool(
    async ({
      userId,
      title,
      expenseAmount,
      expenseCategory,
      expenseDate,
    }: {
      userId: string
      title: string
      expenseAmount: number
      expenseCategory: ExpenseCategory
      expenseDate: string
    }) => {
      try {
        await this.eventEmitter.emitAsync(AppEventMap.CreateExpense, userId, {
          title,
          expenseAmount,
          expenseCategory,
          expenseDate,
        })
        return "Expense created successfully"
      } catch (error) {
        return "Failed to create the expense"
      }
    },
    {
      name: "create_expense",
      description: "Create a new expense for a user",
      schema: z.object({
        userId: z.string().describe("user id of the user"),
        title: z
          .string()
          .optional()
          .describe("expense purpose given by the user - optional"),
        expenseCategory: z
          .nativeEnum(ExpenseCategory)
          .describe(
            `category of the expense - you should decide based on description user gave, if not then ask`
          ),
        expenseAmount: z.coerce
          .number()
          .describe("expense amount given by the user"),
        expenseDate: z
          .string()
          .describe(
            `expense date; natural language allowed (e.g., "next Friday", "in 2 months", "2025-01-31") you need to convert to YYYY-MM-DD format string`
          ),
      }),
    }
  )
}
