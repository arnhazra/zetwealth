import { Injectable } from "@nestjs/common"
import { statusMessages } from "@/shared/constants/status-messages"
import { CommandBus, QueryBus } from "@nestjs/cqrs"
import { Debt } from "./schemas/debt.schema"
import { DeleteDebtCommand } from "./commands/impl/delete-debt.command"
import { CreateDebtCommand } from "./commands/impl/create-debt.command"
import {
  CreateDebtRequestDto,
  CreateDebtServiceSchema,
} from "./dto/request/create-debt.request.dto"
import { UpdateDebtCommand } from "./commands/impl/update-debt.command"
import { FindDebtsByUserQuery } from "./queries/impl/find-debt-by-user.query"
import { FindDebtByIdQuery } from "./queries/impl/find-debt-by-id.query"
import { calculateDebtDetails } from "./helpers/calculate-debt"
import { AgentTool } from "@/intelligence/agent/agent.decorator"
import { z } from "zod"
import { BaseAgentSchema } from "@/intelligence/agent/agent.schema"
import { FindDebtListServiceSchema } from "./dto/request/find-debts.request.dto"
import { assertOwnership } from "@/shared/utils/assert-ownership"

@Injectable()
export class DebtService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  @AgentTool({
    name: "create_debt",
    description: "Create a new debt for a user",
    schema: CreateDebtServiceSchema,
  })
  async create(dto: z.output<typeof CreateDebtServiceSchema>) {
    try {
      const { userId, ...rest } = dto
      return await this.commandBus.execute<CreateDebtCommand, Debt>(
        new CreateDebtCommand(userId, { ...rest })
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  @AgentTool({
    name: "list_debts",
    description: "List down all the debts for a user",
    schema: FindDebtListServiceSchema,
  })
  async findAllByUserId(dto: z.output<typeof FindDebtListServiceSchema>) {
    try {
      const { userId, searchKeyword } = dto
      const debts = await this.queryBus.execute<FindDebtsByUserQuery, Debt[]>(
        new FindDebtsByUserQuery(userId, searchKeyword)
      )

      return await Promise.all(
        debts.map(async (debt) => {
          const calculatedDebtDetails = calculateDebtDetails(debt)
          return calculatedDebtDetails
        })
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async findById(userId: string, debtId: string) {
    try {
      const debt = await this.queryBus.execute<FindDebtByIdQuery, Debt>(
        new FindDebtByIdQuery(debtId)
      )
      assertOwnership(debt, userId)
      const calculatedDebtDetails = calculateDebtDetails(debt)
      return calculatedDebtDetails
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async updateById(
    userId: string,
    debtId: string,
    requestBody: CreateDebtRequestDto
  ) {
    try {
      await this.findById(userId, debtId)
      return await this.commandBus.execute<UpdateDebtCommand, Debt>(
        new UpdateDebtCommand(userId, debtId, requestBody)
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async deleteById(userId: string, debtId: string) {
    try {
      await this.findById(userId, debtId)
      await this.commandBus.execute(new DeleteDebtCommand(debtId))
      return { success: true }
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  @AgentTool({
    name: "fetch_total_debt",
    description: "Get total debt for a user",
    schema: BaseAgentSchema,
  })
  async calculateTotalDebt(dto: z.output<typeof BaseAgentSchema>) {
    try {
      const { userId } = dto
      const debts = await this.findAllByUserId({ userId })

      const remainingDebt = debts.reduce(
        (sum, val) => sum + val.remainingTotal,
        0
      )
      const totalEMI = debts.reduce((sum, val) => sum + val.emi, 0)
      const totalPrincipal = debts.reduce(
        (sum, val) => sum + val.principalAmount,
        0
      )
      return { remainingDebt, totalEMI, totalPrincipal }
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }
}
