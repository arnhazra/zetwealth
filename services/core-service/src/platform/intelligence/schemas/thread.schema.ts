import {
  createSchemaFromClass,
  Entity,
  EntityProp,
  IdentifiableEntitySchmea,
  ObjectId,
  ObjectIdType,
} from "@/shared/entity/entity.schema"

@Entity({ collection: "intelligence-threads" })
export class Thread extends IdentifiableEntitySchmea {
  @EntityProp({ type: ObjectIdType, required: true })
  readonly threadId: ObjectId

  @EntityProp({ type: ObjectIdType, required: true })
  readonly userId: ObjectId

  @EntityProp({ required: true })
  readonly prompt: string

  @EntityProp({ required: true })
  readonly response: string
}

export const ThreadSchema = createSchemaFromClass(Thread)
