import { ICommandHandler, CommandHandler } from "@nestjs/cqrs"
import { EventRepository } from "../../event.repository"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"
import { UpdateEventCommand } from "../impl/update-event.command"

@CommandHandler(UpdateEventCommand)
export class UpdateEventByIdCommandHandler implements ICommandHandler<UpdateEventCommand> {
  constructor(private readonly repository: EventRepository) {}

  async execute(command: UpdateEventCommand) {
    const {
      eventId,
      userId,
      dto: { eventDate, eventName },
    } = command
    return await this.repository.update(
      { _id: createOrConvertObjectId(eventId) },
      {
        userId: createOrConvertObjectId(userId),
        eventName,
        eventDate,
      }
    )
  }
}
