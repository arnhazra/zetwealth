import { Currency } from "country-code-enum"
import {
  createSchemaFromClass,
  Entity,
  EntityProp,
  IdentifiableEntitySchmea,
} from "@/shared/entity/entity.schema"

@Entity({ collection: "users" })
export class User extends IdentifiableEntitySchmea {
  @EntityProp({ required: true, unique: true })
  email: string

  @EntityProp({ required: true })
  name: string

  @EntityProp({ default: "user" })
  role: string

  @EntityProp({ default: Currency.USD })
  baseCurrency: Currency

  @EntityProp({ default: null })
  avatar: string | null

  @EntityProp({ type: Boolean, default: true })
  reduceCarbonEmissions: boolean

  @EntityProp({ type: Boolean, default: true })
  analyticsData: boolean

  @EntityProp({ type: Boolean, default: true })
  useIntelligence: boolean
}

export const UserSchema = createSchemaFromClass(User)
