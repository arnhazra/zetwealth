import { IQueryHandler, QueryHandler } from "@nestjs/cqrs"
import { FindExpenseByIdQuery } from "../impl/find-expense-by-id.query"
import { ExpenseRepository } from "../../expense.repository"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"

@QueryHandler(FindExpenseByIdQuery)
export class FindExpenseByIdQueryHandler implements IQueryHandler<FindExpenseByIdQuery> {
  constructor(private readonly repository: ExpenseRepository) {}

  async execute(query: FindExpenseByIdQuery) {
    const { expenseId } = query
    return await this.repository.findOne({
      _id: createOrConvertObjectId(expenseId),
    })
  }
}
