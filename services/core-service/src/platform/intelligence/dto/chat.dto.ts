import { IsNotEmpty } from "class-validator"

export enum EntityType {
  ASSET = "asset",
  ASSETGROUP = "assetgroup",
  DEBT = "debt",
  GOAL = "goal",
  NEWS = "news",
  CALENDAR_EVENT = "event",
}

export class ChatDto {
  @IsNotEmpty()
  prompt: string
  threadId: string
  entityType?: EntityType
  entityDetails?: string
  summarizeRequest?: boolean
}
