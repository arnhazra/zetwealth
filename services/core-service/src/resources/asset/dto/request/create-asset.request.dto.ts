import { z } from "zod"
import { AssetType, RecurringFrequency } from "@/shared/constants/types"
import { dateString } from "@/shared/validators/zod.validators"
import { createZodDto } from "nestjs-zod"

const BaseAssetSchema = z.object({
  assetgroupId: z.string().min(1),
  assetName: z.string().min(1),
  identifier: z.string().min(1),
})

const LumpsumDepositSchema = BaseAssetSchema.extend({
  assetType: z.literal(AssetType.LUMPSUM_DEPOSIT),
  startDate: dateString,
  maturityDate: dateString,
  amountInvested: z.number(),
  expectedReturnRate: z.number(),
})

const RecurringDepositSchema = BaseAssetSchema.extend({
  assetType: z.literal(AssetType.RECURRING_DEPOSIT),
  startDate: dateString,
  maturityDate: dateString,
  expectedReturnRate: z.number(),
  contributionAmount: z.number(),
  contributionFrequency: z.enum(RecurringFrequency),
})

const BondSchema = BaseAssetSchema.extend({
  assetType: z.literal(AssetType.BOND),
  startDate: dateString,
  maturityDate: dateString,
  amountInvested: z.number(),
  expectedReturnRate: z.number(),
})

const EquitySchema = BaseAssetSchema.extend({
  assetType: z.literal(AssetType.EQUITY),
  units: z.number(),
  unitPurchasePrice: z.number(),
})

const CryptoSchema = BaseAssetSchema.extend({
  assetType: z.literal(AssetType.CRYPTO),
  units: z.number(),
  unitPurchasePrice: z.number(),
})

const RealEstateSchema = BaseAssetSchema.extend({
  assetType: z.literal(AssetType.REAL_ESTATE),
  valuationOnPurchase: z.number(),
  currentValuation: z.number(),
})

const MetalSchema = BaseAssetSchema.extend({
  assetType: z.literal(AssetType.METAL),
  valuationOnPurchase: z.number(),
  currentValuation: z.number(),
})

export const LiquidSchema = BaseAssetSchema.extend({
  assetType: z.literal(AssetType.LIQUID),
  currentValuation: z.number(),
})

export const RetirementSchema = BaseAssetSchema.extend({
  assetType: z.literal(AssetType.RETIREMENT),
  currentValuation: z.number(),
})

const OtherSchema = BaseAssetSchema.extend({
  assetType: z.literal(AssetType.OTHER),
  valuationOnPurchase: z.number(),
  currentValuation: z.number(),
})

export const CreateAssetSchema = z.discriminatedUnion("assetType", [
  LumpsumDepositSchema,
  RecurringDepositSchema,
  BondSchema,
  EquitySchema,
  CryptoSchema,
  RealEstateSchema,
  MetalSchema,
  LiquidSchema,
  RetirementSchema,
  OtherSchema,
])

const WrappedSchema = z.object({
  data: CreateAssetSchema,
})
export class CreateAssetRequestDto extends createZodDto(WrappedSchema) {}
