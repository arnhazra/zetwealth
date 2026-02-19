import { IQueryHandler, QueryHandler } from "@nestjs/cqrs"
import { FindGoalsByUserQuery } from "../impl/find-goal-by-user.query"
import { GoalRepository } from "../../goal.repository"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"

@QueryHandler(FindGoalsByUserQuery)
export class FindGoalsByUserQueryHandler implements IQueryHandler<FindGoalsByUserQuery> {
  constructor(private readonly repository: GoalRepository) {}

  async execute(query: FindGoalsByUserQuery) {
    const { userId } = query

    return this.repository.aggregate([
      { $match: { userId: createOrConvertObjectId(userId) } },
      { $sort: { goalDate: 1 } },
    ])
  }
}
