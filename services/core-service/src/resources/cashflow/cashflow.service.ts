import { Injectable } from "@nestjs/common"
import { statusMessages } from "@/shared/constants/status-messages"
import { CommandBus, QueryBus } from "@nestjs/cqrs"
import { Cashflow, FlowDirection } from "./schemas/cashflow.schema"
import { DeleteCashflowCommand } from "./commands/impl/delete-cashflow.command"
import { CreateCashFlowCommand } from "./commands/impl/create-cashflow.command"
import { FindCashflowsQuery } from "./queries/impl/find-cashflows.query"
import { CreateCashFlowRequestDto } from "./dto/request/create-cashflow.request.dto"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { Asset } from "../asset/schemas/asset.schema"
import { FindCashflowsByUserQuery } from "./queries/impl/find-cashflows-by-user.query"
import { computeNextDate } from "./helpers/compute-next-date"
import { UpdateCashflowCommand } from "./commands/impl/update-cashflow.command"
import { FindCashflowByIdQuery } from "./queries/impl/find-cashflow-by-id.query"
import { AssetService } from "../asset/asset.service"

@Injectable()
export class CashFlowService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly eventEmitter: EventEmitter2,
    private readonly assetService: AssetService
  ) {}

  async create(userId: string, requestBody: CreateCashFlowRequestDto) {
    try {
      return await this.commandBus.execute<CreateCashFlowCommand, Cashflow>(
        new CreateCashFlowCommand(userId, requestBody)
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async findMyCashflows(userId: string, searchKeyword?: string) {
    try {
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
    await this.assetService.updateAssetById(
      String(targetAsset.userId),
      String(targetAsset._id),
      {
        ...rest,
        assetgroupId: String(targetAsset.assetgroupId),
        currentValuation: targetAsset.currentValuation + delta,
      }
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
