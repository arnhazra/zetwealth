import { IQueryHandler, QueryHandler } from "@nestjs/cqrs"
import { FindSubscriptionByUserIdQuery } from "../impl/find-subscription-by-user-id.query"
import { SubscriptionRepository } from "../../repositories/subscription.repository"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"

@QueryHandler(FindSubscriptionByUserIdQuery)
export class FindSubscriptionByUserIdQueryHandler implements IQueryHandler<FindSubscriptionByUserIdQuery> {
  constructor(private readonly repository: SubscriptionRepository) {}

  async execute(query: FindSubscriptionByUserIdQuery) {
    const { userId } = query
    return await this.repository.findOne({
      userId: createOrConvertObjectId(userId),
    })
  }
}
