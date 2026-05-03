import {
  createSchemaFromClass,
  Entity,
  EntityProp,
  IdentifiableEntitySchema,
} from "@/shared/entity/entity.schema"

@Entity({
  collection: "blocklisted-session-ids",
})
export class BlockListedSession extends IdentifiableEntitySchema {
  @EntityProp({ required: true })
  stripeSessionId: string
}

export const BlockListedSessionSchema =
  createSchemaFromClass(BlockListedSession)
