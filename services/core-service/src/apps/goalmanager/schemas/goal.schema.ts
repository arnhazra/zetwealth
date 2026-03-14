import { User } from "@/auth/schemas/user.schema"
import {
  createSchemaFromClass,
  Entity,
  EntityProp,
  IdentifiableEntitySchmea,
  ObjectId,
  ObjectIdType,
} from "@/shared/entity/entity.schema"

@Entity({ collection: "goals" })
export class Goal extends IdentifiableEntitySchmea {
  @EntityProp({ type: ObjectIdType, ref: User.name, required: true })
  userId: ObjectId

  @EntityProp({ required: true })
  goalDate: string

  @EntityProp({ required: true })
  goalAmount: number
}

export const GoalSchema = createSchemaFromClass(Goal)
GoalSchema.index({ userId: 1 })
