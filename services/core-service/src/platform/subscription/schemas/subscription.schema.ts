import { User } from "@/auth/schemas/user.schema"
import {
  createSchemaFromClass,
  Entity,
  EntityProp,
  IdentifiableEntitySchmea,
  ObjectId,
  ObjectIdType,
} from "@/shared/entity/entity.schema"

@Entity({ collection: "subscriptions" })
export class Subscription extends IdentifiableEntitySchmea {
  @EntityProp({
    type: ObjectIdType,
    ref: User.name,
    required: true,
    unique: true,
  })
  userId: ObjectId

  @EntityProp({ required: true })
  price: number

  @EntityProp({
    type: Date,
    default: function () {
      const duration = 365
      return new Date(Date.now() + 1000 * 86400 * duration)
    },
  })
  endsAt: Date
}

export const SubscriptionSchema = createSchemaFromClass(Subscription)
