import { Injectable } from "@nestjs/common"
import { statusMessages } from "@/shared/constants/status-messages"
import { CommandBus, QueryBus } from "@nestjs/cqrs"
import { Goal } from "./schemas/goal.schema"
import { DeleteGoalCommand } from "./commands/impl/delete-goal.command"
import { CreateGoalCommand } from "./commands/impl/create-goal.command"
import {
  CreateGoalRequestDto,
  CreateGoalServiceSchema,
  GoalByIdServiceSchema,
} from "./dto/request.dto"
import { UpdateGoalCommand } from "./commands/impl/update-goal.command"
import { FindGoalsByUserQuery } from "./queries/impl/find-goal-by-user.query"
import { FindGoalByIdQuery } from "./queries/impl/find-goal-by-id.query"
import { FindNearestGoalQuery } from "./queries/impl/find-nearest-goal.query"
import { z } from "zod"
import { AgentTool } from "@/intelligence/agent/agent.decorator"
import { BaseAgentSchema } from "@/intelligence/agent/agent.schema"
import { assertOwnership } from "@/shared/utils/assert-ownership"

@Injectable()
export class GoalService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  @AgentTool({
    name: "create_goal",
    description: "Create a new goal for a user",
    schema: CreateGoalServiceSchema,
  })
  async create(dto: z.output<typeof CreateGoalServiceSchema>) {
    try {
      const { userId, ...rest } = dto
      return await this.commandBus.execute<CreateGoalCommand, Goal>(
        new CreateGoalCommand(userId, { ...rest })
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  @AgentTool({
    name: "get_goal_list",
    description: "List down all goals for user",
    schema: BaseAgentSchema,
  })
  async findAllByUserId(dto: z.output<typeof BaseAgentSchema>) {
    try {
      const { userId } = dto
      return await this.queryBus.execute<FindGoalsByUserQuery, Goal[]>(
        new FindGoalsByUserQuery(userId)
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  @AgentTool({
    name: "get_user_nearest_goal",
    description: "Get nearest goal of a user",
    schema: BaseAgentSchema,
  })
  async findNearestGoal(dto: z.output<typeof BaseAgentSchema>) {
    try {
      const { userId } = dto
      const goal = await this.queryBus.execute<FindNearestGoalQuery, Goal>(
        new FindNearestGoalQuery(userId)
      )
      return goal ?? null
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async findById(dto: z.output<typeof GoalByIdServiceSchema>) {
    try {
      const { goalId, userId } = dto
      const goal = await this.queryBus.execute<FindGoalByIdQuery, Goal>(
        new FindGoalByIdQuery(goalId)
      )
      assertOwnership(goal, userId)
      return goal
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async updateById(userId: string, goalId: string, dto: CreateGoalRequestDto) {
    try {
      await this.findById({ userId, goalId })
      return await this.commandBus.execute<UpdateGoalCommand, Goal>(
        new UpdateGoalCommand(userId, goalId, dto)
      )
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }

  async deleteById(dto: z.output<typeof GoalByIdServiceSchema>) {
    try {
      const { userId, goalId } = dto
      await this.findById({ userId, goalId })
      await this.commandBus.execute(new DeleteGoalCommand(goalId))
      return { success: true }
    } catch (error) {
      throw new Error(statusMessages.connectionError)
    }
  }
}
