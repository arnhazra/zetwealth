import { CreateExpenseRequestDto } from "../../dto/request/request.dto"

export class CreateExpenseCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: CreateExpenseRequestDto
  ) {}
}
