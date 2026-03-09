import { endPoints } from "@/shared/constants/api-endpoints"

export const excludedKeys = [
  "_id",
  "userId",
  "spaceId",
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
  "presentValuation",
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

export const editEntityUrlMap = {
  asset: "/apps/assetmanager/asset/edit",
  debt: "/apps/debttrack/createoreditdebt",
  goal: "/apps/goalmanager/createoreditgoal",
  cashflow: "/apps/cashflow/createoreditcashflow",
}

export const deleteEntityAPIUriMap = {
  asset: endPoints.asset,
  debt: endPoints.debt,
  goal: endPoints.goal,
  cashflow: endPoints.cashflow,
}

export enum EntityTypeForDetailModal {
  ASSET = "asset",
  DEBT = "debt",
  GOAL = "goal",
  CASHFLOW = "cashflow",
}
