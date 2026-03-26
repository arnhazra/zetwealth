import {
  Article,
  Asset,
  Cashflow,
  Debt,
  Goal,
  AssetGroup,
} from "@/shared/constants/types"

export enum EntityType {
  ASSET = "asset",
  ASSETGROUP = "Asset Group",
  DEBT = "debt",
  GOAL = "goal",
  NEWS = "news",
  EXPENSE = "expense",
  CASHFLOW = "cashflow",
  CALENDAR_EVENT = "event",
}

export type EntityMap = {
  [EntityType.ASSET]: Asset
  [EntityType.ASSETGROUP]: AssetGroup
  [EntityType.DEBT]: Debt
  [EntityType.GOAL]: Goal
  [EntityType.NEWS]: Article
  [EntityType.CASHFLOW]: Cashflow
}

export const createEntityUrlMap: Partial<Record<EntityType, string>> = {
  [EntityType.ASSET]: "/apps/assetmanager/asset/create",
  [EntityType.DEBT]: "/apps/debttrack/createoreditdebt",
  [EntityType.ASSETGROUP]: "/apps/assetmanager/createoreditassetgroup",
  [EntityType.GOAL]: "/apps/goalmanager/createoreditgoal",
  [EntityType.NEWS]: "/apps/discover",
  [EntityType.EXPENSE]: "/apps/expensetrack/createoreditexpense",
  [EntityType.CASHFLOW]: "/apps/cashflow/createoreditcashflow",
}
