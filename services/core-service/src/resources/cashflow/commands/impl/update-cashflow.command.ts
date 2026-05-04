import { CreateCashFlowRequestDto } from "../../dto/request/request.dto"

export class UpdateCashflowCommand {
  constructor(
    public readonly cashflowId: string,
    public readonly dto: CreateCashFlowRequestDto
  ) {}
}
