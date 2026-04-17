import { AppEventMap } from "@/shared/constants/app-events.map"
import { tool } from "langchain"
import { Injectable } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { z } from "zod"
import { Debt } from "@/resources/debt/schemas/debt.schema"

@Injectable()
export class DebtAgent {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  public createDebtTool = tool(
    async ({
      userId,
      debtPurpose,
      identifier,
      startDate,
      endDate,
      principalAmount,
      interestRate,
    }: {
      userId: string
      debtPurpose: string
      identifier: string
      startDate: string
      endDate: string
      principalAmount: number
      interestRate: number
    }) => {
      try {
        await this.eventEmitter.emitAsync(AppEventMap.CreateDebt, userId, {
          debtPurpose,
          identifier,
          startDate,
          endDate,
          principalAmount,
          interestRate,
        })
        return "Debt created successfully"
      } catch (error) {
        return "Failed to create the debt"
      }
    },
    {
      name: "create_debt",
      description: "Create a new debt for a user",
      schema: z.object({
        userId: z.string().describe("user id of the user"),
        debtPurpose: z.string().describe("debt purpose given by the user"),
        identifier: z.string().describe("identifier given by the user"),
        startDate: z
          .string()
          .describe(
            `start date; natural language allowed (e.g., "next Friday", "in 2 months", "2025-01-31") you need to convert to YYYY-MM-DD format string`
          ),
        endDate: z
          .string()
          .describe(
            `end date; natural language allowed (e.g., "next Friday", "in 2 months", "2025-01-31") you need to convert to YYYY-MM-DD format string`
          ),
        principalAmount: z.coerce
          .number()
          .describe("principal amount given by the user"),
        interestRate: z.coerce
          .number()
          .describe("interest rate % given by the user"),
      }),
    }
  )

  public getDebtListTool = tool(
    async ({
      userId,
      searchKeyword,
    }: {
      userId: string
      searchKeyword: string
    }) => {
      try {
        const debts: Debt[] = await this.eventEmitter.emitAsync(
          AppEventMap.GetDebtList,
          userId,
          searchKeyword
        )

        return JSON.stringify(debts)
      } catch (error) {
        return "Unable to get the debt list"
      }
    },
    {
      name: "get_debt_list",
      description: "List down all the debts for a user",
      schema: z.object({
        userId: z.string().describe("user id of the user"),
        searchKeyword: z
          .string()
          .describe("debt name given by the user to search - this is optional"),
      }),
    }
  )

  public getTotalDebtTool = tool(
    async ({ userId }: { userId: string }) => {
      try {
        const valuation = (
          await this.eventEmitter.emitAsync(AppEventMap.GetTotalDebt, userId)
        ).shift()
        return `Total debt details is ${JSON.stringify(valuation)}`
      } catch (error) {
        return "Unable to get total debt"
      }
    },
    {
      name: "get_total_debt_by_userid",
      description: "Get total debt for a user",
      schema: z.object({
        userId: z.string().describe("user id of the user"),
      }),
    }
  )
}
