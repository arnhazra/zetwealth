import { CreateExpenseRequestDto } from "../../dto/request/request.dto"

export class UpdateExpenseCommand {
  constructor(
    public readonly userId: string,
    public readonly expenseId: string,
    public readonly dto: CreateExpenseRequestDto
  ) {}
}
