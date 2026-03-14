import { User } from "@/auth/schemas/user.schema"
import { ExpenseCategory } from "@/shared/constants/types"
import {
  createSchemaFromClass,
  Entity,
  EntityProp,
  IdentifiableEntitySchmea,
  ObjectId,
  ObjectIdType,
} from "@/shared/entity/entity.schema"

@Entity({ collection: "expenses" })
export class Expense extends IdentifiableEntitySchmea {
  @EntityProp({ type: ObjectIdType, ref: User.name, required: true })
  userId: ObjectId

  @EntityProp()
  title?: string

  @EntityProp({ required: true })
  expenseAmount: number

  @EntityProp({ required: true, enum: ExpenseCategory })
  expenseCategory: ExpenseCategory

  @EntityProp({ required: true })
  expenseDate: string
}

export const ExpenseSchema = createSchemaFromClass(Expense)
ExpenseSchema.index({ userId: 1 })
