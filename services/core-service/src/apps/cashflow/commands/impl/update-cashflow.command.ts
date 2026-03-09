import { CreateCashFlowRequestDto } from "../../dto/request/create-cashflow.request.dto"

export class UpdateCashflowCommand {
  constructor(
    public readonly userId: string,
    public readonly cashflowId: string,
    public readonly dto: CreateCashFlowRequestDto
  ) {}
}
