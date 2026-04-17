import { Subscription } from "@/platform/subscription/schemas/subscription.schema"

export enum AssetType {
  LUMPSUM_DEPOSIT = "LUMPSUM_DEPOSIT",
  RECURRING_DEPOSIT = "RECURRING_DEPOSIT",
  METAL = "METAL",
  REAL_ESTATE = "REAL_ESTATE",
  BOND = "BOND",
  LIQUID = "LIQUID",
  RETIREMENT = "RETIREMENT",
  EQUITY = "EQUITY",
  CRYPTO = "CRYPTO",
  OTHER = "OTHER",
}

export enum RecurringFrequency {
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  HALF_YEARLY = "HALF_YEARLY",
  YEARLY = "YEARLY",
}

export enum ExpenseCategory {
  FOOD_GROCERIES = "FOOD_GROCERIES",
  TRANSPORTATION = "TRANSPORTATION",
  HOUSING_RENT = "HOUSING_RENT",
  BILLS_UTILITIES = "BILLS_UTILITIES",
  ENTERTAINMENT = "ENTERTAINMENT",
  SHOPPING = "SHOPPING",
  EDUCATION = "EDUCATION",
  DEBT_INSTALLMENT = "DEBT_INSTALLMENT",
  MISCELLANEOUS = "MISCELLANEOUS",
}

export interface ExpenseCategoryConfig {
  expenseCategories: {
    displayName: string
    value: ExpenseCategory
    icon: string
  }[]
}

export interface SubscriptionRes extends Subscription {
  isActive: boolean
}
