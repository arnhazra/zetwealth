import { Injectable } from "@nestjs/common"
import { CommandBus, QueryBus } from "@nestjs/cqrs"
import { CreateThreadCommand } from "./commands/impl/create-thread.command"
import { Thread } from "./schemas/thread.schema"
import { ConversationDto } from "./dto/conversation.dto"
import { FetchThreadByIdQuery } from "./queries/impl/fetch-thread-by-id.query"
import {
  ConversationArgs,
  IntelligenceOrchestrator,
} from "./intelligence.orchestrator"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"
import { AuthService } from "@/auth/auth.service"

@Injectable()
export class IntelligenceService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly orchestrator: IntelligenceOrchestrator,
    private readonly authService: AuthService
  ) {}

  async getThreadById(threadId: string, isFirstMessage: boolean) {
    try {
      if (isFirstMessage) {
        return []
      }

      const thread = await this.queryBus.execute<
        FetchThreadByIdQuery,
        Thread[]
      >(new FetchThreadByIdQuery(threadId))
      if (!!thread && thread.length) {
        return thread
      } else {
        throw new Error("Thread not found")
      }
    } catch (error) {
      throw error
    }
  }

  async *conversation(
    dto: ConversationDto,
    userId: string
  ): AsyncGenerator<{ type: string; data: string }> {
    const { prompt } = dto
    const threadId = dto.threadId ?? createOrConvertObjectId().toString()
    const thread = await this.getThreadById(threadId, !dto.threadId)
    let fullResponse = ""
    const user = await this.authService.findUserById(userId)

    const args: ConversationArgs = {
      thread,
      prompt,
      user,
    }

    for await (const token of this.orchestrator.conversation(args)) {
      fullResponse += token
      yield { type: "token", data: token }
    }

    await this.commandBus.execute<CreateThreadCommand, Thread>(
      new CreateThreadCommand(String(user._id), threadId, prompt, fullResponse)
    )

    yield { type: "threadId", data: threadId }
  }
}
