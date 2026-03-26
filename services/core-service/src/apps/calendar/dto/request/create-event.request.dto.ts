import { IsNotEmpty, Matches } from "class-validator"

export class CreateEventRequestDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  eventDate: string

  @IsNotEmpty()
  eventName: string
}
