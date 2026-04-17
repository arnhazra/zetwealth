import { PlatformConfig } from "@/shared/constants/types"
import { formatCurrency } from "@/shared/lib/format-currency"
import { Currency } from "country-code-enum"

export const resolveWidgetPlaceholders = (
  platformConfig: PlatformConfig | undefined
) => {
  const widgets = platformConfig?.widgetConfig?.widgets
  if (!widgets) return []

  const now = new Date()
  const monthYear = now.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  })

  const assetValue = (Math.floor(Math.random() * 900) + 100) * 1_000_000
  const expenseValue = (Math.floor(Math.random() * 9) + 1) * 1_00000
  const goalAmount = (Math.floor(Math.random() * 500) + 10) * 1_000_0000
  const remainingDebt = (Math.floor(Math.random() * 200) + 50) * 1_000
  const totalEmi = (Math.floor(Math.random() * 5) + 1) * 1_000

  const replacements: Record<string, string> = {
    ASSET_VALUE: formatCurrency(assetValue, Currency.USD),
    EXPENSE_VALUE: formatCurrency(expenseValue, Currency.USD),
    GOAL_AMOUNT: formatCurrency(goalAmount, Currency.USD),
    REMAINING_DEBT: formatCurrency(remainingDebt, Currency.USD),
    TOTAL_EMI: formatCurrency(totalEmi, Currency.USD),
    MONTH_YEAR: monthYear,
    GOAL_PERCENTAGE: String(
      assetValue / goalAmount > 1
        ? 100
        : Math.floor((assetValue / goalAmount) * 100)
    ),
  }

  const json = JSON.stringify(widgets)
  const resolved = json.replace(
    /\{([A-Z_]+)\}/g,
    (_, key) => replacements[key] ?? `{${key}}`
  )
  return JSON.parse(resolved)
}
