import { AssetGroup } from "./assetgroup.schema"
import { User } from "@/auth/schemas/user.schema"
import { AssetType, RecurringFrequency } from "@/shared/constants/types"
import {
  createSchemaFromClass,
  Entity,
  EntityProp,
  IdentifiableEntitySchema,
  ObjectId,
  ObjectIdType,
} from "@/shared/entity/entity.schema"

@Entity({ collection: "assets" })
export class Asset extends IdentifiableEntitySchema {
  @EntityProp({ type: ObjectIdType, ref: User.name, required: true })
  userId: ObjectId // COMMON

  @EntityProp({
    type: ObjectIdType,
    ref: AssetGroup.name,
    required: true,
  })
  assetgroupId: ObjectId // COMMON

  @EntityProp({ required: true })
  assetType: AssetType // COMMON

  @EntityProp({ required: true })
  assetName: string // COMMON

  @EntityProp({ required: true })
  identifier: string // COMMON

  @EntityProp()
  startDate?: string // LUMPSUM_DEPOSIT, RECURRING_DEPOSIT, BOND

  @EntityProp()
  maturityDate?: string // LUMPSUM_DEPOSIT, RECURRING_DEPOSIT, BOND

  @EntityProp()
  amountInvested?: number // LUMPSUM_DEPOSIT, BOND

  @EntityProp()
  expectedReturnRate?: number // LUMPSUM_DEPOSIT, RECURRING_DEPOSIT, BOND

  @EntityProp()
  contributionAmount?: number // RECURRING_DEPOSIT

  @EntityProp()
  contributionFrequency?: RecurringFrequency // RECURRING_DEPOSIT

  @EntityProp()
  valuationOnPurchase?: number // REAL_ESTATE, METAL, OTHER

  @EntityProp()
  currentValuation?: number // LIQUID, RETIREMENT, REAL_ESTATE, METAL, OTHER

  @EntityProp()
  units?: number // EQUITY, CRYPTO

  @EntityProp()
  unitPurchasePrice?: number // EQUITY, CRYPTO
}

export const AssetSchema = createSchemaFromClass(Asset)
AssetSchema.index({ assetgroupId: 1, userId: 1 })
