import { CreateGoalRequestDto } from "../../dto/request/create-goal.request.dto"

export class CreateGoalCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: CreateGoalRequestDto
  ) {}
}
