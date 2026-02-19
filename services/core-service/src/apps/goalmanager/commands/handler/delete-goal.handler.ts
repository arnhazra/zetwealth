import { ICommandHandler, CommandHandler } from "@nestjs/cqrs"
import { DeleteGoalCommand } from "../impl/delete-goal.command"
import { GoalRepository } from "../../goal.repository"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"

@CommandHandler(DeleteGoalCommand)
export class DeleteGoalCommandHandler implements ICommandHandler<DeleteGoalCommand> {
  constructor(private readonly repository: GoalRepository) {}

  async execute(command: DeleteGoalCommand) {
    const { goalId } = command
    return await this.repository.delete({
      _id: createOrConvertObjectId(goalId),
    })
  }
}
