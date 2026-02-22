import { Injectable } from "@nestjs/common"
import { CommandBus, QueryBus } from "@nestjs/cqrs"
import { CreateThreadCommand } from "./commands/impl/create-thread.command"
import { Thread } from "./schemas/thread.schema"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { AppEventMap } from "@/shared/constants/app-events.map"
import { ChatDto } from "./dto/chat.dto"
import { FetchThreadByIdQuery } from "./queries/impl/fetch-thread-by-id.query"
import { User } from "@/auth/schemas/user.schema"
import { ChatArgs, ChatStrategy } from "./strategies/chat.strategy"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"

@Injectable()
export class IntelligenceService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly chatStrategy: ChatStrategy,
    private readonly eventEmitter: EventEmitter2
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

  async chat(chatDto: ChatDto, userId: string) {
    try {
      const { prompt, entityDetails, entityType, summarizeRequest } = chatDto
      const threadId = chatDto.threadId ?? createOrConvertObjectId().toString()
      const thread = await this.getThreadById(threadId, !chatDto.threadId)

      const user: User = (
        await this.eventEmitter.emitAsync(AppEventMap.GetUserDetails, userId)
      ).shift()

      const args: ChatArgs = {
        thread,
        prompt,
        user,
        entityDetails,
        entityType,
        summarizeRequest,
      }

      const { response } = await this.chatStrategy.chat(args)
      await this.commandBus.execute<CreateThreadCommand, Thread>(
        new CreateThreadCommand(String(user._id), threadId, prompt, response)
      )
      return { response, threadId }
    } catch (error) {
      throw error
    }
  }
}
