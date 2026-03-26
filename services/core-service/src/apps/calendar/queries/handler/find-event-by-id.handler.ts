import { IQueryHandler, QueryHandler } from "@nestjs/cqrs"
import { FindEventByIdQuery } from "../impl/find-event-by-id.query"
import { EventRepository } from "../../event.repository"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"
import { Event } from "../../schemas/event.schema"

@QueryHandler(FindEventByIdQuery)
export class FindEventByIdQueryHandler implements IQueryHandler<FindEventByIdQuery> {
  constructor(private readonly repository: EventRepository) {}

  async execute(query: FindEventByIdQuery): Promise<Event | null> {
    return this.repository.findOne({
      _id: createOrConvertObjectId(query.eventId),
      userId: createOrConvertObjectId(query.userId),
    })
  }
}
