import { Injectable } from "@nestjs/common"
import { statusMessages } from "@/shared/constants/status-messages"
import { CommandBus, QueryBus } from "@nestjs/cqrs"
import { Cashflow, FlowDirection } from "./schemas/cashflow.schema"
import { DeleteCashflowCommand } from "./commands/impl/delete-cashflow.command"
import { CreateCashFlowCommand } from "./commands/impl/create-cashflow.command"
import { FindCashflowsQuery } from "./queries/impl/find-cashflows.query"
import { CreateCashFlowRequestDto } from "./dto/request/create-cashflow.request.dto"
import { Asset } from "../asset/schemas/asset.schema"
import { FindCashflowsByUserQuery } from "./queries/impl/find-cashflows-by-user.query"
import { computeNextDate } from "./helpers/compute-next-date"
import { UpdateCashflowCommand } from "./commands/impl/update-cashflow.command"
import { FindCashflowByIdQuery } from "./queries/impl/find-cashflow-by-id.query"
import { AssetService } from "../asset/asset.service"
import { AgentTool } from "@/intelligence/agent/agent.decorator"
import {
  CreateCashflowSchema,
  FindCashflowsSchema,
} from "./schemas/cashflowagent.schema"
import { z } from "zod"
import {
  LiquidSchema,
  RetirementSchema,
} from "../asset/dto/request/create-asset.request.dto"

@Injectable()
export class CashFlowService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly assetService: AssetService
  ) {}

  @AgentTool({
    name: "create_cashflow",
    description: "Create a cashflow",
    schema: CreateCashflowSchema,
  })
  async create(dto: z.output<typeof CreateCashflowSchema>) {
    try {
      const { userId, ...rest } = dto
      return await this.commandBus.execute<CreateCashFlowCommand, Cashflow>(
        new CreateCashFlowCommand(userId, { ...rest })
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  @AgentTool({
    name: "get_cashflows_list",
    description: "Get list of cashflows for a user",
    schema: FindCashflowsSchema,
  })
  async findMyCashflows(dto: z.output<typeof FindCashflowsSchema>) {
    try {
      const { userId, searchKeyword } = dto
      return await this.queryBus.execute<FindCashflowsByUserQuery, Cashflow[]>(
        new FindCashflowsByUserQuery(userId, searchKeyword)
      )
    } catch (error) {
      throw new Error(error ?? statusMessages.connectionError)
    }
  }

  async delete(reqUserId: string, cashflowId: string) {
    try {
      await this.commandBus.execute(new DeleteCashflowCommand(cashflowId))
      return { success: true }
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async findById(userId: string, cashflowId: string) {
    try {
      const result = await this.queryBus.execute(
        new FindCashflowByIdQuery(userId, cashflowId)
      )
      return result
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async updateById(
    userId: string,
    cashflowId: string,
    dto: CreateCashFlowRequestDto
  ) {
    try {
      const result = await this.commandBus.execute(
        new UpdateCashflowCommand(userId, cashflowId, dto)
      )
      return result
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async processCashflow(cashflow: Cashflow) {
    const targetAsset: Asset = await this.assetService.findAssetById(
      String(cashflow.userId),
      String(cashflow.targetAsset)
    )

    if (!targetAsset) return

    const delta =
      cashflow.flowDirection === FlowDirection.INWARD
        ? cashflow.amount
        : -cashflow.amount

    const { assetgroupId, currentValuation, ...rest } = targetAsset
    const stringifiedUserId = String(targetAsset.userId)
    const stringifiedAssetId = String(targetAsset._id)

    const updatePayload: z.infer<
      typeof LiquidSchema | typeof RetirementSchema
    > = {
      assetName: targetAsset.assetName,
      assetgroupId: String(assetgroupId),
      currentValuation: targetAsset.currentValuation + delta,
      identifier: targetAsset.identifier,
      assetType: targetAsset.assetType as any,
    }

    await this.assetService.updateAssetById(
      stringifiedUserId,
      stringifiedAssetId,
      updatePayload
    )

    cashflow.nextExecutionAt = computeNextDate(cashflow)
    await cashflow.save()
  }

  async executeCashFlows() {
    try {
      const cashflows = await this.queryBus.execute<
        FindCashflowsQuery,
        Cashflow[]
      >(new FindCashflowsQuery())

      for (const cashflow of cashflows) {
        await this.processCashflow(cashflow)
      }

      return { success: true }
    } catch {
      throw new Error(statusMessages.connectionError)
    }
  }
}
