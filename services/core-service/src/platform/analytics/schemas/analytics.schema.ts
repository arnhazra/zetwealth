import { User } from "@/auth/schemas/user.schema"
import {
  createSchemaFromClass,
  Entity,
  EntityProp,
  IdentifiableEntitySchmea,
  ObjectId,
  ObjectIdType,
} from "@/shared/entity/entity.schema"

@Entity({ collection: "analytics" })
export class Analytics extends IdentifiableEntitySchmea {
  @EntityProp({ type: ObjectIdType, ref: User.name, required: true })
  userId: ObjectId

  @EntityProp({ required: true })
  method: string

  @EntityProp({ required: true })
  apiUri: string
}

export const AnalyticsSchema = createSchemaFromClass(Analytics)
AnalyticsSchema.index({ userId: 1 })
