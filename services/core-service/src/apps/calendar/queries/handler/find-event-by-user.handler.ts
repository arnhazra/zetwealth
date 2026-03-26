import { IQueryHandler, QueryHandler } from "@nestjs/cqrs"
import { FindEventsByUserQuery } from "../impl/find-event-by-user.query"
import { EventRepository } from "../../event.repository"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"

@QueryHandler(FindEventsByUserQuery)
export class FindEventsByUserQueryHandler implements IQueryHandler<FindEventsByUserQuery> {
  constructor(private readonly repository: EventRepository) {}

  async execute(query: FindEventsByUserQuery) {
    const { userId } = query

    return this.repository.aggregate([
      { $match: { userId: createOrConvertObjectId(userId) } },
      { $sort: { eventDate: 1 } },
    ])
  }
}
