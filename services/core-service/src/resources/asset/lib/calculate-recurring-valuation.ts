import { RecurringFrequency } from "@/shared/constants/types"
import { Asset } from "../schemas/asset.schema"

export default function calculateRecurringValuation(asset: Asset): number {
  const {
    startDate,
    maturityDate,
    contributionAmount,
    contributionFrequency,
    expectedReturnRate,
  } = asset

  const today = new Date()
  const effectiveDate =
    today > new Date(maturityDate) ? new Date(maturityDate) : today
  const diffInMs = effectiveDate.getTime() - new Date(startDate).getTime()
  if (diffInMs < 0) return 0
  const days = diffInMs / (1000 * 60 * 60 * 24)
  const years = days / 365.25

  let n: number
  switch (contributionFrequency) {
    case RecurringFrequency.MONTHLY:
      n = 12
      break
    case RecurringFrequency.QUARTERLY:
      n = 4
      break
    case RecurringFrequency.HALF_YEARLY:
      n = 2
      break
    case RecurringFrequency.YEARLY:
      n = 1
      break
    default:
      throw new Error("Invalid contribution frequency")
  }

  const r = expectedReturnRate / 100
  const ratePerPeriod = r / n
  const totalPeriods = Math.floor(n * years) + 1

  if (totalPeriods === 1) return contributionAmount

  const amount =
    contributionAmount *
    ((Math.pow(1 + ratePerPeriod, totalPeriods) - 1) / ratePerPeriod) *
    (1 + ratePerPeriod)

  return amount
}
