import { ICommandHandler, CommandHandler } from "@nestjs/cqrs"
import { CreateGoalCommand } from "../impl/create-goal.command"
import { GoalRepository } from "../../goal.repository"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"

@CommandHandler(CreateGoalCommand)
export class CreateGoalCommandHandler implements ICommandHandler<CreateGoalCommand> {
  constructor(private readonly repository: GoalRepository) {}

  async execute(command: CreateGoalCommand) {
    const { userId, dto } = command
    return await this.repository.create({
      userId: createOrConvertObjectId(userId),
      ...dto,
    })
  }
}
