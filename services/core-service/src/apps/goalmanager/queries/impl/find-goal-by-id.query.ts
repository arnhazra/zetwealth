export class FindGoalByIdQuery {
  constructor(
    public readonly userId: string,
    public readonly goalId: string
  ) {}
}
