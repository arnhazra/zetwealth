import { AssetType } from "@/shared/constants/types"
import { tool } from "langchain"
import { Injectable } from "@nestjs/common"
import { z } from "zod"
import { GetByUserIdSchema } from "../../platform/intelligence/agents/asset/asset.schems"
import { AssetService } from "./asset.service"
import { AssetGroup } from "@/resources/asset/schemas/assetgroup.schema"
import {
  CreateAssetGroupSchema,
  GetAssetGroupListSchema,
  GetAssetGroupValuationSchema,
} from "../../platform/intelligence/agents/assetgroup/assetgroup.schema"

@Injectable()
export class AssetAgent {
  constructor(private readonly service: AssetService) {}

  public getAssetTypesTool = tool(
    async () => {
      return Object.values(AssetType)
    },
    {
      name: "get_asset_types",
      description: "Get types of assets",
      schema: z.object({}),
    }
  )

  public getAssetListTool = tool(
    async ({ userId }: { userId: string }) => {
      try {
        const assets = await this.service.findAllMyAssets(userId)
        return JSON.stringify(assets)
      } catch (error) {
        return "Unable to get the asset list"
      }
    },
    {
      name: "get_asset_list",
      description: "Get asset list for a user",
      schema: GetByUserIdSchema,
    }
  )

  public getTotalAssetTool = tool(
    async ({ userId }: { userId: string }) => {
      try {
        const valuation =
          await this.service.calculateTotalAssetValuation(userId)
        return `Total asset is ${valuation}`
      } catch (error) {
        return "Unable to get total assets"
      }
    },
    {
      name: "get_total_asset_by_userid",
      description: "Get total asset for a user",
      schema: GetByUserIdSchema,
    }
  )

  public createAssetGroupTool = tool(
    async ({
      userId,
      assetgroupName,
    }: {
      userId: string
      assetgroupName: string
    }) => {
      try {
        await this.service.createAssetGroup(userId, {
          assetgroupName,
        })
        return "AssetGroup created successfully"
      } catch (error) {
        return "Failed to create the assetgroup"
      }
    },
    {
      name: "create_assetgroup",
      description: "Create a assetgroup for a user",
      schema: CreateAssetGroupSchema,
    }
  )

  public getAssetGroupListTool = tool(
    async ({
      userId,
      searchKeyword,
    }: {
      userId: string
      searchKeyword: string
    }) => {
      try {
        const assetgroups: AssetGroup[] = await this.service.findMyAssetGroups(
          userId,
          searchKeyword
        )
        return JSON.stringify(assetgroups)
      } catch (error) {
        return "Unable to get the assetgroup list"
      }
    },
    {
      name: "get_assetgroup_list",
      description: "Get assetgroup list for a user",
      schema: GetAssetGroupListSchema,
    }
  )

  public getAssetGroupValuationTool = tool(
    async ({
      userId,
      assetgroupName,
    }: {
      userId: string
      assetgroupName: string
    }) => {
      try {
        const assetgroup: any = (
          await this.service.findMyAssetGroups(userId, assetgroupName)
        ).shift()
        const valuation = assetgroup.currentValuation ?? 0
        return `Valuation is ${valuation}`
      } catch (error) {
        return "Unable to get the valuation"
      }
    },
    {
      name: "get_assetgroup_valuation_by_assetgroup_name",
      description: "Get assetgroup valuation for a specific assetgroup",
      schema: GetAssetGroupValuationSchema,
    }
  )
}
