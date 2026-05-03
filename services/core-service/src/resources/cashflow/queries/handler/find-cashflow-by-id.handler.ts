import { IQueryHandler, QueryHandler } from "@nestjs/cqrs"
import { FindCashflowByIdQuery } from "../impl/find-cashflow-by-id.query"
import { CashFlowRepository } from "../../cashflow.repository"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"
import { Cashflow } from "../../schemas/cashflow.schema"

@QueryHandler(FindCashflowByIdQuery)
export class FindCashflowByIdHandler implements IQueryHandler<FindCashflowByIdQuery> {
  constructor(private readonly repository: CashFlowRepository) {}

  async execute(query: FindCashflowByIdQuery): Promise<Cashflow | null> {
    return this.repository.findOne({
      _id: createOrConvertObjectId(query.cashflowId),
    })
  }
}
