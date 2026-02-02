import { IQueryHandler, QueryHandler } from "@nestjs/cqrs"
import { FindCashflowsQuery } from "../impl/find-cashflows.query"
import { CashFlowRepository } from "../../cashflow.repository"
import { formatDateString } from "@/shared/utils/date-formatter"

@QueryHandler(FindCashflowsQuery)
export class FindCashflowsQueryHandler implements IQueryHandler<FindCashflowsQuery> {
  constructor(private readonly repository: CashFlowRepository) {}

  async execute(_: FindCashflowsQuery) {
    const today = formatDateString()

    return this.repository.find({
      nextExecutionAt: today,
    })
  }
}
