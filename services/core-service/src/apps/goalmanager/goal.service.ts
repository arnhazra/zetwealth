import { Injectable } from "@nestjs/common"
import { statusMessages } from "@/shared/constants/status-messages"
import { CommandBus, QueryBus } from "@nestjs/cqrs"
import { Goal } from "./schemas/goal.schema"
import { DeleteGoalCommand } from "./commands/impl/delete-goal.command"
import { CreateGoalCommand } from "./commands/impl/create-goal.command"
import { CreateGoalRequestDto } from "./dto/request/create-goal.request.dto"
import { UpdateGoalCommand } from "./commands/impl/update-goal.command"
import { FindGoalsByUserQuery } from "./queries/impl/find-goal-by-user.query"
import { FindGoalByIdQuery } from "./queries/impl/find-goal-by-id.query"
import { FindNearestGoalQuery } from "./queries/impl/find-nearest-goal.query"
import { OnEvent } from "@nestjs/event-emitter"
import { AppEventMap } from "@/shared/constants/app-events.map"

@Injectable()
export class GoalService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  @OnEvent(AppEventMap.CreateGoal)
  async createGoal(userId: string, requestBody: CreateGoalRequestDto) {
    try {
      return await this.commandBus.execute<CreateGoalCommand, Goal>(
        new CreateGoalCommand(userId, requestBody)
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  @OnEvent(AppEventMap.GetGoalList)
  async findMyGoals(userId: string) {
    try {
      return await this.queryBus.execute<FindGoalsByUserQuery, Goal[]>(
        new FindGoalsByUserQuery(userId)
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  @OnEvent(AppEventMap.GetNearestGoal)
  async findNearestGoal(userId: string) {
    try {
      const goal = await this.queryBus.execute<FindNearestGoalQuery, Goal>(
        new FindNearestGoalQuery(userId)
      )
      return goal ?? null
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async findGoalById(reqUserId: string, goalId: string) {
    try {
      return await this.queryBus.execute<FindGoalByIdQuery, Goal>(
        new FindGoalByIdQuery(reqUserId, goalId)
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async updateGoalById(
    userId: string,
    goalId: string,
    requestBody: CreateGoalRequestDto
  ) {
    try {
      return await this.commandBus.execute<UpdateGoalCommand, Goal>(
        new UpdateGoalCommand(userId, goalId, requestBody)
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async deleteGoal(reqUserId: string, goalId: string) {
    try {
      const { userId } = await this.queryBus.execute<FindGoalByIdQuery, Goal>(
        new FindGoalByIdQuery(reqUserId, goalId)
      )
      if (userId.toString() === reqUserId) {
        await this.commandBus.execute(new DeleteGoalCommand(goalId))
        return { success: true }
      }

      throw new Error(statusMessages.connectionError)
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }
}
