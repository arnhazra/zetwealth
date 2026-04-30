import { CreateGoalRequestDto } from "../../dto/request.dto"

export class CreateGoalCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: CreateGoalRequestDto
  ) {}
}
