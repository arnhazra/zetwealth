import { CreateCashFlowRequestDto } from "../../dto/request/request.dto"

export class CreateCashFlowCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: CreateCashFlowRequestDto
  ) {}
}
