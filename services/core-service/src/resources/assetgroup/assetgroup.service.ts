import { Injectable } from "@nestjs/common"
import { statusMessages } from "@/shared/constants/status-messages"
import { CommandBus, QueryBus } from "@nestjs/cqrs"
import { FindAllAssetGroupQuery } from "./queries/impl/find-all-assetgroups.query"
import { FindAssetGroupByIdQuery } from "./queries/impl/find-assetgroup-by-id.query"
import { AssetGroup } from "./schemas/assetgroup.schema"
import { DeleteAssetGroupCommand } from "./commands/impl/delete-assetgroup.command"
import { CreateAssetGroupCommand } from "./commands/impl/create-assetgroup.command"
import { CreateAssetGroupRequestDto } from "./dto/request/create-assetgroup.request.dto"
import { UpdateAssetGroupCommand } from "./commands/impl/update-assetgroup.command"
import { OnEvent } from "@nestjs/event-emitter"
import { AppEventMap } from "@/shared/constants/app-events.map"
import { AssetService } from "../asset/asset.service"

@Injectable()
export class AssetGroupService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly assetService: AssetService
  ) {}

  @OnEvent(AppEventMap.CreateAssetGroup)
  async createAssetGroup(
    userId: string,
    requestBody: CreateAssetGroupRequestDto
  ) {
    try {
      return await this.commandBus.execute<CreateAssetGroupCommand, AssetGroup>(
        new CreateAssetGroupCommand(userId, requestBody)
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  @OnEvent(AppEventMap.GetAssetGroupList)
  async findMyAssetGroups(userId: string, searchKeyword?: string) {
    const assetgroups = await this.queryBus.execute<
      FindAllAssetGroupQuery,
      AssetGroup[]
    >(new FindAllAssetGroupQuery(userId, searchKeyword))

    return await Promise.all(
      assetgroups.map(async (assetgroup) => {
        const valuation = await this.assetService.calculateAssetGroupValuation(
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

  async findAssetGroupById(reqUserId: string, assetgroupId: string) {
    try {
      const assetgroup = await this.queryBus.execute<
        FindAssetGroupByIdQuery,
        AssetGroup
      >(new FindAssetGroupByIdQuery(reqUserId, assetgroupId))

      const valuation = await this.assetService.calculateAssetGroupValuation(
        reqUserId,
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
      return await this.commandBus.execute<UpdateAssetGroupCommand, AssetGroup>(
        new UpdateAssetGroupCommand(userId, assetgroupId, requestBody)
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async deleteAssetGroup(reqUserId: string, assetgroupId: string) {
    try {
      const { userId } = await this.queryBus.execute<
        FindAssetGroupByIdQuery,
        AssetGroup
      >(new FindAssetGroupByIdQuery(reqUserId, assetgroupId))
      if (userId.toString() === reqUserId) {
        await this.commandBus.execute(new DeleteAssetGroupCommand(assetgroupId))
        return { success: true }
      }

      throw new Error(statusMessages.connectionError)
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }
}
