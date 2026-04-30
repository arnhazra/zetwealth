import { CreateGoalRequestDto } from "../../dto/request.dto"

export class UpdateGoalCommand {
  constructor(
    public readonly userId: string,
    public readonly goalId: string,
    public readonly dto: CreateGoalRequestDto
  ) {}
}
