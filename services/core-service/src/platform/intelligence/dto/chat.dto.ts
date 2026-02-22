import { IsNotEmpty } from "class-validator"

export enum EntityType {
  ASSET = "asset",
  SPACE = "space",
  DEBT = "debt",
  GOAL = "goal",
  NEWS = "news",
  PLANNER_EVENT = "event",
}

export class ChatDto {
  @IsNotEmpty()
  prompt: string
  threadId: string
  entityType?: EntityType
  entityDetails?: string
  summarizeRequest?: boolean
}
