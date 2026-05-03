import { User } from "@/auth/schemas/user.schema"
import {
  createSchemaFromClass,
  Entity,
  EntityProp,
  IdentifiableEntitySchema,
  ObjectId,
  ObjectIdType,
} from "@/shared/entity/entity.schema"

@Entity({ collection: "tokens" })
export class Token extends IdentifiableEntitySchema {
  @EntityProp({
    type: ObjectIdType,
    ref: User.name,
    required: true,
  })
  userId: ObjectId

  @EntityProp({ required: true })
  token: string
}

export const TokenSchema = createSchemaFromClass(Token)
TokenSchema.index({ userId: 1 })
