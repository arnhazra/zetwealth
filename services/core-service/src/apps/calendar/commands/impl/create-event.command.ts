import { CreateEventRequestDto } from "../../dto/request/create-event.request.dto"

export class CreateEventCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: CreateEventRequestDto
  ) {}
}
