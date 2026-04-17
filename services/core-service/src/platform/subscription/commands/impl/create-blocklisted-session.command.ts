export class CreateBlockListedSessionCommand {
  constructor(public readonly stripeSessionId: string) {}
}
