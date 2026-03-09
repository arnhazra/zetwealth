export class FindCashflowByIdQuery {
  constructor(
    public readonly userId: string,
    public readonly cashflowId: string
  ) {}
}
