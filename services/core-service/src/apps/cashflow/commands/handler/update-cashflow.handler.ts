import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { UpdateCashflowCommand } from "../impl/update-cashflow.command"
import { CashFlowRepository } from "../../cashflow.repository"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"
import { Cashflow } from "../../schemas/cashflow.schema"

@CommandHandler(UpdateCashflowCommand)
export class UpdateCashflowHandler implements ICommandHandler<UpdateCashflowCommand> {
  constructor(private readonly repository: CashFlowRepository) {}

  async execute(command: UpdateCashflowCommand): Promise<Cashflow | null> {
    const { userId, cashflowId, dto } = command
    return this.repository.update(
      {
        _id: createOrConvertObjectId(cashflowId),
        userId: createOrConvertObjectId(userId),
      },
      { $set: dto }
    )
  }
}
