import { Injectable } from "@nestjs/common"
import { statusMessages } from "@/shared/constants/status-messages"
import { CommandBus, QueryBus } from "@nestjs/cqrs"
import { FindAssetsByAssetGroupQuery } from "./queries/impl/find-assets-by-assetgroup.query"
import { FindAssetByIdQuery } from "./queries/impl/find-asset-by-id.query"
import { Asset } from "./schemas/asset.schema"
import { DeleteAssetCommand } from "./commands/impl/delete-asset.command"
import { CreateAssetCommand } from "./commands/impl/create-asset.command"
import { CreateAssetRequestDto } from "./dto/request/create-asset.request.dto"
import { UpdateAssetCommand } from "./commands/impl/update-asset.command"
import { FindAssetsByUserQuery } from "./queries/impl/find-assets-by-user.query"
import { AssetType } from "@/shared/constants/types"
import calculateComplexValuation from "./lib/calculate-complex-valuation"
import calculateRecurringValuation from "./lib/calculate-recurring-valuation"
import { isMatured, isMaturityApproaching } from "./lib/maturity-calculator"
import { FindAssetsByTypesQuery } from "./queries/impl/find-assets-by-types.query"
import calculateSimpleValuation from "./lib/calculate-simple-valuation"
import calculateUnitValuation from "./lib/calculate-unit-valuation"
import { FindAllAssetGroupQuery } from "./queries/impl/find-all-assetgroups.query"
import { FindAssetGroupByIdQuery } from "./queries/impl/find-assetgroup-by-id.query"
import { AssetGroup } from "./schemas/assetgroup.schema"
import { DeleteAssetGroupCommand } from "./commands/impl/delete-assetgroup.command"
import { CreateAssetGroupCommand } from "./commands/impl/create-assetgroup.command"
import {
  CreateAssetGroupRequestDto,
  CreateAssetGroupServiceSchema,
} from "./dto/request/create-assetgroup.request.dto"
import { UpdateAssetGroupCommand } from "./commands/impl/update-assetgroup.command"
import { AgentTool } from "@/intelligence/agent/agent.decorator"
import {
  GetAssetGroupListSchema,
  GetAssetGroupValuationSchema,
} from "./dto/request/other.request.dto"
import { z } from "zod"
import { BaseAgentSchema } from "@/intelligence/agent/agent.schema"
import { assertOwnership } from "@/shared/utils/assert-ownership"

@Injectable()
export class AssetService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  @AgentTool({
    name: "get_asset_types",
    description: "Get all asset types",
    schema: z.object({}),
  })
  getAssetTypes() {
    return Object.values(AssetType)
  }

  async createAsset(userId: string, dto: CreateAssetRequestDto) {
    try {
      return await this.commandBus.execute<CreateAssetCommand, Asset>(
        new CreateAssetCommand(userId, dto)
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async findAssetsByAssetGroupId(
    userId: string,
    assetgroupId: string,
    searchKeyword?: string
  ) {
    try {
      await this.findAssetGroupById(userId, assetgroupId)
      const assets = await this.queryBus.execute<
        FindAssetsByAssetGroupQuery,
        Asset[]
      >(new FindAssetsByAssetGroupQuery(userId, assetgroupId, searchKeyword))

      return await Promise.all(
        assets.map(async (asset) => {
          const valuation = this.calculateAssetValuation(asset)

          return {
            ...(asset.toObject?.() ?? asset),
            currentValuation: valuation,
            isMaturityApproaching: isMaturityApproaching(asset),
            isMatured: isMatured(asset),
          }
        })
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async findAssetsByTypes(userId: string, assetTypes: string[]) {
    try {
      return await this.queryBus.execute<FindAssetsByTypesQuery, Asset[]>(
        new FindAssetsByTypesQuery(userId, assetTypes)
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  @AgentTool({
    name: "get_all_assets",
    description:
      "Get all assets belonging to a user with their current valuations",
    schema: BaseAgentSchema,
  })
  async findAssetsByUser(dto: z.output<typeof BaseAgentSchema>) {
    try {
      const { userId } = dto
      const assets = await this.queryBus.execute<
        FindAssetsByUserQuery,
        Asset[]
      >(new FindAssetsByUserQuery(userId))

      return await Promise.all(
        assets.map(async (asset) => {
          const valuation = this.calculateAssetValuation(asset)

          return {
            ...(asset.toObject?.() ?? asset),
            currentValuation: valuation,
            isMaturityApproaching: isMaturityApproaching(asset),
            isMatured: isMatured(asset),
          }
        })
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async findAssetById(userId: string, assetId: string) {
    try {
      const asset = await this.queryBus.execute<FindAssetByIdQuery, Asset>(
        new FindAssetByIdQuery(assetId)
      )
      assertOwnership(asset, userId)
      const valuation = this.calculateAssetValuation(asset)

      return {
        ...(asset.toObject?.() ?? asset),
        currentValuation: valuation,
        isMaturityApproaching: isMaturityApproaching(asset),
        isMatured: isMatured(asset),
      }
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async updateAssetById(
    userId: string,
    assetId: string,
    requestBody: CreateAssetRequestDto
  ) {
    try {
      await this.findAssetById(userId, assetId)
      return await this.commandBus.execute<UpdateAssetCommand, Asset>(
        new UpdateAssetCommand(userId, assetId, requestBody)
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async deleteAssetById(userId: string, assetId: string) {
    try {
      await this.findAssetById(userId, assetId)
      await this.commandBus.execute(new DeleteAssetCommand(assetId))
      return { success: true }
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  calculateAssetValuation(asset: Asset) {
    try {
      const simpleValuationAssets = [
        AssetType.LIQUID,
        AssetType.RETIREMENT,
        AssetType.REAL_ESTATE,
        AssetType.METAL,
        AssetType.OTHER,
      ]
      const complexValuationAssets = [AssetType.LUMPSUM_DEPOSIT, AssetType.BOND]
      const recurringValuationAssets = [AssetType.RECURRING_DEPOSIT]
      const unitValuationAssets = [AssetType.EQUITY, AssetType.CRYPTO]

      if (simpleValuationAssets.includes(asset.assetType)) {
        return calculateSimpleValuation(asset)
      }

      if (complexValuationAssets.includes(asset.assetType)) {
        return calculateComplexValuation(asset)
      }

      if (recurringValuationAssets.includes(asset.assetType)) {
        return calculateRecurringValuation(asset)
      }

      if (unitValuationAssets.includes(asset.assetType)) {
        return calculateUnitValuation(asset)
      }

      return 0
    } catch (error) {
      return 0
    }
  }

  async calculateAssetGroupValuation(userId: string, assetgroupId: string) {
    try {
      const assets = await this.queryBus.execute<
        FindAssetsByAssetGroupQuery,
        Asset[]
      >(new FindAssetsByAssetGroupQuery(userId, assetgroupId))

      const valuations = await Promise.all(
        assets.map((asset) => this.calculateAssetValuation(asset))
      )
      const total = valuations.reduce((sum, val) => sum + val, 0)
      return { total, assetCount: assets ? assets.length : 0 }
    } catch (error) {
      throw new Error()
    }
  }

  @AgentTool({
    name: "get_asset_group_valuation",
    description:
      "Get the total current valuation and asset count for a specific asset group by its name",
    schema: GetAssetGroupValuationSchema,
  })
  async getAssetGroupValuationByName(
    dto: z.output<typeof GetAssetGroupValuationSchema>
  ) {
    const { userId, assetgroupName } = dto
    try {
      const assetgroups = await this.queryBus.execute<
        FindAllAssetGroupQuery,
        AssetGroup[]
      >(new FindAllAssetGroupQuery(userId, assetgroupName))

      if (!assetgroups || assetgroups.length === 0) {
        throw new Error(statusMessages.connectionError)
      }

      const assetgroup = assetgroups[0]
      return await this.calculateAssetGroupValuation(
        userId,
        assetgroup._id.toString()
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  @AgentTool({
    name: "get_total_asset_valuation",
    description:
      "Calculate and return the total current valuation of all assets for a user",
    schema: BaseAgentSchema,
  })
  async calculateTotalAssetValuation(dto: z.output<typeof BaseAgentSchema>) {
    const { userId } = dto
    try {
      const assets = await this.queryBus.execute<
        FindAssetsByUserQuery,
        Asset[]
      >(new FindAssetsByUserQuery(userId))

      const valuations = await Promise.all(
        assets.map((asset) => this.calculateAssetValuation(asset))
      )
      const total = valuations.reduce((sum, val) => sum + val, 0)
      return total
    } catch (error) {
      throw new Error()
    }
  }

  @AgentTool({
    name: "create_asset_group",
    description: "Create a new asset group for a user",
    schema: CreateAssetGroupServiceSchema,
  })
  async createAssetGroup(dto: z.output<typeof CreateAssetGroupServiceSchema>) {
    try {
      const { userId, assetgroupName } = dto
      return await this.commandBus.execute<CreateAssetGroupCommand, AssetGroup>(
        new CreateAssetGroupCommand(userId, { assetgroupName })
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  @AgentTool({
    name: "get_asset_groups",
    description:
      "List all asset groups for a user with their current valuations and asset counts",
    schema: GetAssetGroupListSchema,
  })
  async findAssetGroupsByUser(dto: z.output<typeof GetAssetGroupListSchema>) {
    const { userId, searchKeyword } = dto
    const assetgroups = await this.queryBus.execute<
      FindAllAssetGroupQuery,
      AssetGroup[]
    >(new FindAllAssetGroupQuery(userId, searchKeyword))

    return await Promise.all(
      assetgroups.map(async (assetgroup) => {
        const valuation = await this.calculateAssetGroupValuation(
          userId,
          assetgroup._id.toString()
        )
        return {
          ...(assetgroup.toObject?.() ?? assetgroup),
          currentValuation: valuation.total,
          assetCount: valuation.assetCount,
        }
      })
    )
  }

  async findAssetGroupById(userId: string, assetgroupId: string) {
    try {
      const assetgroup = await this.queryBus.execute<
        FindAssetGroupByIdQuery,
        AssetGroup
      >(new FindAssetGroupByIdQuery(assetgroupId))
      assertOwnership(assetgroup, userId)

      const valuation = await this.calculateAssetGroupValuation(
        userId,
        assetgroup._id.toString()
      )
      return {
        ...(assetgroup.toObject?.() ?? assetgroup),
        currentValuation: valuation.total,
        assetCount: valuation.assetCount,
      }
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async updateAssetGroupById(
    userId: string,
    assetgroupId: string,
    requestBody: CreateAssetGroupRequestDto
  ) {
    try {
      await this.findAssetGroupById(userId, assetgroupId)
      return await this.commandBus.execute<UpdateAssetGroupCommand, AssetGroup>(
        new UpdateAssetGroupCommand(assetgroupId, requestBody)
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async deleteAssetGroup(userId: string, assetgroupId: string) {
    try {
      await this.findAssetGroupById(userId, assetgroupId)
      await this.commandBus.execute(new DeleteAssetGroupCommand(assetgroupId))
      return { success: true }
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }
}
