import { ICommandHandler, CommandHandler } from "@nestjs/cqrs"
import { CreateBlockListedSessionCommand } from "../impl/create-blocklisted-session.command"
import { BlockListedSessionRepository } from "../../repositories/blocklisted-session.repository"

@CommandHandler(CreateBlockListedSessionCommand)
export class CreateBlockListedSessionCommandHandler
  implements ICommandHandler<CreateBlockListedSessionCommand>
{
  constructor(private readonly repository: BlockListedSessionRepository) {}

  async execute(command: CreateBlockListedSessionCommand) {
    const { stripeSessionId } = command
    await this.repository.create({ stripeSessionId })
  }
}
