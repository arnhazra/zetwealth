import { IsNumber, Matches } from "class-validator"

export class CreateGoalRequestDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  goalDate: string

  @IsNumber()
  goalAmount: number
}
