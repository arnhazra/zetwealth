import { IQueryHandler, QueryHandler } from "@nestjs/cqrs"
import { FindBlockListedSessionByIdQuery } from "../impl/find-blocklisted-session.query"
import { BlockListedSessionRepository } from "../../repositories/blocklisted-session.repository"

@QueryHandler(FindBlockListedSessionByIdQuery)
export class FindBlockListedSessionByIdQueryHandler
  implements IQueryHandler<FindBlockListedSessionByIdQuery>
{
  constructor(private readonly repository: BlockListedSessionRepository) {}

  async execute(query: FindBlockListedSessionByIdQuery) {
    const { stripeSessionId } = query
    return await this.repository.findOne({ stripeSessionId })
  }
}
