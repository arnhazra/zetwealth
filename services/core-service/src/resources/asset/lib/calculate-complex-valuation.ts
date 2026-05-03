import { Asset } from "../schemas/asset.schema"

export default function calculateComplexValuation(asset: Asset): number {
  const { amountInvested, startDate, maturityDate, expectedReturnRate } = asset
  const today = new Date()
  const effectiveDate =
    today > new Date(maturityDate) ? new Date(maturityDate) : today
  const diffInMs = effectiveDate.getTime() - new Date(startDate).getTime()
  if (diffInMs <= 0) return amountInvested
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24)
  const quarters = diffInDays / (365.25 / 4)
  const annualRate = expectedReturnRate / 100
  const quarterlyRate = annualRate / 4
  const fullQuarters = Math.floor(quarters)
  const amount = amountInvested * Math.pow(1 + quarterlyRate, fullQuarters)
  return amount
}
