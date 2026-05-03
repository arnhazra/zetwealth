import { z } from "zod"
import { AssetType, RecurringFrequency } from "@/shared/constants/types"
import { dateString } from "@/shared/validators/zod.validators"
import { createZodDto } from "nestjs-zod"

const BaseAssetSchema = z.object({
  assetgroupId: z.string(),
  assetName: z.string(),
  identifier: z.string(),
})

const LumpsumDepositSchema = BaseAssetSchema.extend({
  assetType: z.literal(AssetType.LUMPSUM_DEPOSIT),
  startDate: dateString,
  maturityDate: dateString,
  amountInvested: z.number().positive(),
  expectedReturnRate: z.number().positive(),
})

const RecurringDepositSchema = BaseAssetSchema.extend({
  assetType: z.literal(AssetType.RECURRING_DEPOSIT),
  startDate: dateString,
  maturityDate: dateString,
  expectedReturnRate: z.number().positive(),
  contributionAmount: z.number().positive(),
  contributionFrequency: z.enum(RecurringFrequency),
})

const BondSchema = BaseAssetSchema.extend({
  assetType: z.literal(AssetType.BOND),
  startDate: dateString,
  maturityDate: dateString,
  amountInvested: z.number().positive(),
  expectedReturnRate: z.number().positive(),
})

const EquitySchema = BaseAssetSchema.extend({
  assetType: z.literal(AssetType.EQUITY),
  units: z.number().positive(),
  unitPurchasePrice: z.number().positive(),
})

const CryptoSchema = BaseAssetSchema.extend({
  assetType: z.literal(AssetType.CRYPTO),
  units: z.number().positive(),
  unitPurchasePrice: z.number().positive(),
})

const RealEstateSchema = BaseAssetSchema.extend({
  assetType: z.literal(AssetType.REAL_ESTATE),
  valuationOnPurchase: z.number().positive(),
  currentValuation: z.number().positive(),
})

const MetalSchema = BaseAssetSchema.extend({
  assetType: z.literal(AssetType.METAL),
  valuationOnPurchase: z.number().positive(),
  currentValuation: z.number().positive(),
})

export const LiquidSchema = BaseAssetSchema.extend({
  assetType: z.literal(AssetType.LIQUID),
  currentValuation: z.number().positive(),
})

export const RetirementSchema = BaseAssetSchema.extend({
  assetType: z.literal(AssetType.RETIREMENT),
  currentValuation: z.number().positive(),
})

const OtherSchema = BaseAssetSchema.extend({
  assetType: z.literal(AssetType.OTHER),
  valuationOnPurchase: z.number().positive(),
  currentValuation: z.number().positive(),
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
