import { User } from "@/auth/schemas/user.schema"
import {
  createSchemaFromClass,
  Entity,
  EntityProp,
  IdentifiableEntitySchema,
  ObjectId,
  ObjectIdType,
} from "@/shared/entity/entity.schema"

@Entity({ collection: "assetgroups" })
export class AssetGroup extends IdentifiableEntitySchema {
  @EntityProp({ type: ObjectIdType, ref: User.name, required: true })
  userId: ObjectId

  @EntityProp({ required: true })
  assetgroupName: string
}

export const AssetGroupSchema = createSchemaFromClass(AssetGroup)
AssetGroupSchema.index({ userId: 1 })
