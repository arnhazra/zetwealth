import { IQueryHandler, QueryHandler } from "@nestjs/cqrs"
import { FindNearestGoalQuery } from "../impl/find-nearest-goal.query"
import { GoalRepository } from "../../goal.repository"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"

@QueryHandler(FindNearestGoalQuery)
export class FindNearestGoalQueryHandler implements IQueryHandler<FindNearestGoalQuery> {
  constructor(private readonly repository: GoalRepository) {}

  async execute(query: FindNearestGoalQuery) {
    const today = new Date()
    const todayStr = today.toISOString().slice(0, 10)
    const { userId } = query

    const data = await this.repository
      .find({
        userId: createOrConvertObjectId(userId),
        goalDate: { $gte: todayStr },
      })
      .sort({ goalDate: 1 })
      .exec()

    return data.length > 0 ? data[0] : null
  }
}
