import { endPoints } from "@/shared/constants/api-endpoints"

export const excludedKeys = [
  "_id",
  "userId",
  "assetgroupId",
  "assetType",
  "assetName",
  "createdAt",
  "isMaturityApproaching",
  "isMatured",
  "debtPurpose",
  "targetAsset",
]

export const amountKeys = [
  "amountInvested",
  "contributionAmount",
  "currentValuation",
  "unitPurchasePrice",
  "valuationOnPurchase",
  "goalAmount",
  "principalAmount",
  "totalRepayment",
  "totalInterest",
  "emi",
  "remainingPrincipal",
  "remainingTotal",
]

export const editResourceUrlMap = {
  asset: "/apps/assetmanager/asset/edit",
  debt: "/apps/debttrack/createoreditdebt",
  goal: "/apps/wealthplanner/createoreditgoal",
  cashflow: "/apps/cashflow/createoreditcashflow",
}

export const deleteResourceAPIUriMap = {
  asset: endPoints.asset,
  debt: endPoints.debt,
  goal: endPoints.goal,
  cashflow: endPoints.cashflow,
}

export enum ResourceTypeForDetailModal {
  ASSET = "asset",
  DEBT = "debt",
  GOAL = "goal",
  CASHFLOW = "cashflow",
}
