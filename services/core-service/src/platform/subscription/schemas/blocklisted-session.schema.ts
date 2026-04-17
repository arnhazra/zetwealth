import {
  createSchemaFromClass,
  Entity,
  EntityProp,
  IdentifiableEntitySchmea,
} from "@/shared/entity/entity.schema"

@Entity({
  collection: "blocklisted-session-ids",
})
export class BlockListedSession extends IdentifiableEntitySchmea {
  @EntityProp({ required: true })
  stripeSessionId: string
}

export const BlockListedSessionSchema =
  createSchemaFromClass(BlockListedSession)
