import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { IntelligenceRepository } from "../../intelligence.repository"
import { CreateThreadCommand } from "../impl/create-thread.command"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"

@CommandHandler(CreateThreadCommand)
export class CreateThreadCommandHandler implements ICommandHandler<CreateThreadCommand> {
  constructor(private readonly repository: IntelligenceRepository) {}

  async execute(command: CreateThreadCommand) {
    const { userId, threadId, prompt, response } = command
    return await this.repository.create({
      userId: createOrConvertObjectId(userId),
      threadId: createOrConvertObjectId(threadId),
      prompt,
      response,
    })
  }
}
