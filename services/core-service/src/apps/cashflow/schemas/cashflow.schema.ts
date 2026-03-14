import { Asset } from "@/apps/assetmanager/asset/schemas/asset.schema"
import { User } from "@/auth/schemas/user.schema"
import {
  createSchemaFromClass,
  Entity,
  EntityProp,
  IdentifiableEntitySchmea,
  ObjectId,
  ObjectIdType,
} from "@/shared/entity/entity.schema"

export enum FlowDirection {
  INWARD = "INWARD",
  OUTWARD = "OUTWARD",
}

export enum FlowFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

@Entity({ collection: "cashflows" })
export class Cashflow extends IdentifiableEntitySchmea {
  @EntityProp({ type: ObjectIdType, ref: User.name, required: true })
  userId: ObjectId

  @EntityProp({ type: ObjectIdType, ref: Asset.name, required: true })
  targetAsset: ObjectId

  @EntityProp({ required: true })
  description: string

  @EntityProp({ required: true, enum: FlowDirection })
  flowDirection: FlowDirection

  @EntityProp({ required: true })
  amount: number

  @EntityProp({ required: true, enum: FlowFrequency })
  frequency: FlowFrequency

  @EntityProp()
  nextExecutionAt?: string
}

export const CashflowSchema = createSchemaFromClass(Cashflow)
CashflowSchema.index({ userId: 1 })
