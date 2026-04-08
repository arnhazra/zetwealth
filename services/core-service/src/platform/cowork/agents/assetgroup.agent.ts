import { AppEventMap } from "@/shared/constants/app-events.map"
import { tool } from "langchain"
import { Injectable } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { z } from "zod"
import { AssetGroup } from "@/resources/assetgroup/schemas/assetgroup.schema"

@Injectable()
export class AssetGroupAgent {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  public createAssetGroupTool = tool(
    async ({
      userId,
      assetgroupName,
    }: {
      userId: string
      assetgroupName: string
    }) => {
      try {
        await this.eventEmitter.emitAsync(
          AppEventMap.CreateAssetGroup,
          userId,
          {
            assetgroupName,
          }
        )
        return "AssetGroup created successfully"
      } catch (error) {
        return "Failed to create the assetgroup"
      }
    },
    {
      name: "create_assetgroup",
      description: "Create a assetgroup for a user",
      schema: z.object({
        userId: z.string().describe("user id of the user"),
        assetgroupName: z
          .string()
          .describe("assetgroup name given by the user"),
      }),
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
        const assetgroups: AssetGroup[] = await this.eventEmitter.emitAsync(
          AppEventMap.GetAssetGroupList,
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
      schema: z.object({
        userId: z.string().describe("user id of the user"),
        searchKeyword: z
          .string()
          .describe(
            "assetgroup name given by the user to search - this is optional"
          ),
      }),
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
          await this.eventEmitter.emitAsync(
            AppEventMap.GetAssetGroupList,
            userId,
            assetgroupName
          )
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
      schema: z.object({
        userId: z.string().describe("user id of the user"),
        assetgroupName: z
          .string()
          .describe("assetgroup name given by the user"),
      }),
    }
  )
}
