import { ICommandHandler, CommandHandler } from "@nestjs/cqrs"
import { CreateEventCommand } from "../impl/create-event.command"
import { EventRepository } from "../../event.repository"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"

@CommandHandler(CreateEventCommand)
export class CreateEventCommandHandler implements ICommandHandler<CreateEventCommand> {
  constructor(private readonly repository: EventRepository) {}

  async execute(command: CreateEventCommand) {
    const {
      userId,
      dto: { eventDate, eventName },
    } = command
    return await this.repository.create({
      userId: createOrConvertObjectId(userId),
      eventName,
      eventDate,
    })
  }
}
