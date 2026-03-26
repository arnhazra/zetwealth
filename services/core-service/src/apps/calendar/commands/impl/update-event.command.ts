import { CreateEventRequestDto } from "../../dto/request/create-event.request.dto"

export class UpdateEventCommand {
  constructor(
    public readonly userId: string,
    public readonly eventId: string,
    public readonly dto: CreateEventRequestDto
  ) {}
}
