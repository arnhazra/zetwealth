import { Injectable } from "@nestjs/common"
import { statusMessages } from "@/shared/constants/status-messages"
import { CommandBus, QueryBus } from "@nestjs/cqrs"
import { Cashflow, FlowDirection } from "./schemas/cashflow.schema"
import { DeleteCashflowCommand } from "./commands/impl/delete-cashflow.command"
import { CreateCashFlowCommand } from "./commands/impl/create-cashflow.command"
import { FindCashflowsByDayQuery } from "./queries/impl/find-cashflows-by-day.query"
import {
  CreateCashFlowRequestDto,
  CreateCashflowServiceSchema,
} from "./dto/request/create-cashflow.request.dto"
import { Asset } from "../asset/schemas/asset.schema"
import { FindCashflowsByUserQuery } from "./queries/impl/find-cashflows-by-user.query"
import { computeNextDate } from "./helpers/compute-next-date"
import { UpdateCashflowCommand } from "./commands/impl/update-cashflow.command"
import { FindCashflowByIdQuery } from "./queries/impl/find-cashflow-by-id.query"
import { AssetService } from "../asset/asset.service"
import { AgentTool } from "@/intelligence/agent/agent.decorator"
import { z } from "zod"
import {
  LiquidSchema,
  RetirementSchema,
} from "../asset/dto/request/create-asset.request.dto"
import { FindCashflowsSchema } from "./dto/request/find-cashflow.dto"
import { assertOwnership } from "@/shared/utils/assert-ownership"
import { BaseAgentSchema } from "@/intelligence/agent/agent.schema"
import { AssetType } from "@/shared/constants/types"

@Injectable()
export class CashFlowService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly assetService: AssetService
  ) {}

  @AgentTool({
    name: "list_eligible_assets",
    description: "List eligible assets to create a cashflow",
    schema: CreateCashflowServiceSchema,
  })
  async listEligibleAssets(dto: z.output<typeof BaseAgentSchema>) {
    try {
      return await this.assetService.findAssetsByTypes(dto.userId, [
        AssetType.RETIREMENT,
        AssetType.LIQUID,
        AssetType.OTHER,
      ])
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  @AgentTool({
    name: "create_cashflow",
    description:
      "Create a new cashflow for a user - list eligible assets before this to determine target asset",
    schema: CreateCashflowServiceSchema,
  })
  async create(dto: z.output<typeof CreateCashflowServiceSchema>) {
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
    name: "list_cashflows",
    description: "Get list of cashflows for a user",
    schema: FindCashflowsSchema,
  })
  async findAllByUserId(dto: z.output<typeof FindCashflowsSchema>) {
    try {
      const { userId, searchKeyword } = dto
      return await this.queryBus.execute<FindCashflowsByUserQuery, Cashflow[]>(
        new FindCashflowsByUserQuery(userId, searchKeyword)
      )
    } catch (error) {
      throw new Error(error ?? statusMessages.connectionError)
    }
  }

  async findById(userId: string, cashflowId: string) {
    try {
      const cashflow = await this.queryBus.execute(
        new FindCashflowByIdQuery(cashflowId)
      )
      assertOwnership(cashflow, userId)
      return cashflow
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
      await this.findById(userId, cashflowId)
      const result = await this.commandBus.execute(
        new UpdateCashflowCommand(cashflowId, dto)
      )
      return result
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async deleteById(userId: string, cashflowId: string) {
    try {
      await this.findById(userId, cashflowId)
      await this.commandBus.execute(new DeleteCashflowCommand(cashflowId))
      return { success: true }
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
      { data: updatePayload }
    )

    cashflow.nextExecutionAt = computeNextDate(cashflow)
    await cashflow.save()
  }

  async executeCashFlows() {
    try {
      const cashflows = await this.queryBus.execute<
        FindCashflowsByDayQuery,
        Cashflow[]
      >(new FindCashflowsByDayQuery())

      for (const cashflow of cashflows) {
        await this.processCashflow(cashflow)
      }

      return { success: true }
    } catch {
      throw new Error(statusMessages.connectionError)
    }
  }
}
