import { IQueryHandler, QueryHandler } from "@nestjs/cqrs"
import { FindDebtByIdQuery } from "../impl/find-debt-by-id.query"
import { DebtRepository } from "../../debt.repository"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"

@QueryHandler(FindDebtByIdQuery)
export class FindDebtByIdQueryHandler implements IQueryHandler<FindDebtByIdQuery> {
  constructor(private readonly repository: DebtRepository) {}

  async execute(query: FindDebtByIdQuery) {
    const { debtId } = query
    return await this.repository.findOne({
      _id: createOrConvertObjectId(debtId),
    })
  }
}
