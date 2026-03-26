export class FindEventByIdQuery {
  constructor(
    public readonly userId: string,
    public readonly eventId: string
  ) {}
}
