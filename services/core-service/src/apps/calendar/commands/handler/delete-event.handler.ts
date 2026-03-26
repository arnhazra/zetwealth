import { ICommandHandler, CommandHandler } from "@nestjs/cqrs"
import { DeleteEventCommand } from "../impl/delete-event.command"
import { EventRepository } from "../../event.repository"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"

@CommandHandler(DeleteEventCommand)
export class DeleteEventCommandHandler implements ICommandHandler<DeleteEventCommand> {
  constructor(private readonly repository: EventRepository) {}

  async execute(command: DeleteEventCommand) {
    const { eventId } = command
    return await this.repository.delete({
      _id: createOrConvertObjectId(eventId),
    })
  }
}
