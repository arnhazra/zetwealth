import { IQueryHandler, QueryHandler } from "@nestjs/cqrs"
import { FindCashflowsByDayQuery } from "../impl/find-cashflows-by-day.query"
import { CashFlowRepository } from "../../cashflow.repository"
import { formatDateString } from "@/shared/utils/date-formatter"

@QueryHandler(FindCashflowsByDayQuery)
export class FindCashflowsByDayQueryHandler implements IQueryHandler<FindCashflowsByDayQuery> {
  constructor(private readonly repository: CashFlowRepository) {}

  async execute(_: FindCashflowsByDayQuery) {
    const today = formatDateString()

    return this.repository.find({
      nextExecutionAt: today,
    })
  }
}
