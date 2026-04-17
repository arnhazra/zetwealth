import { Injectable } from "@nestjs/common"
import { Thread } from "./schemas/thread.schema"
import { config } from "@/config"
import { AIMessage, createAgent, HumanMessage, SystemMessage } from "langchain"
import { User } from "@/auth/schemas/user.schema"
import { LLMService } from "@/shared/llm/llm.service"
import { ChatOpenAI, ChatOpenAICallOptions } from "@langchain/openai"
import { ConfigService } from "@/platform/config/config.service"

export interface TaxStrategyType {
  temperature: number
  topP: number
  thread: Thread[]
  prompt: string
  threadId: string
  user: User
}

@Injectable()
export class TaxStrategy {
  constructor(
    private readonly configService: ConfigService,
    private readonly llmService: LLMService
  ) {}

  private async getSystemInstruction(user: User) {
    const data = await this.configService.getConfig(
      "taxadvisor-system-instruction"
    )
    const content = data
      .replaceAll("{platformName}", config.PLATFORM_NAME)
      .replaceAll("{todaysDate}", new Date().toString())
      .replaceAll("{userDetails}", JSON.stringify(user))
    return content
  }

  private createAdvisorAgent(llm: ChatOpenAI<ChatOpenAICallOptions>) {
    return createAgent({
      model: llm,
      stateSchema: undefined,
    })
  }

  private buildMessages(args: TaxStrategyType, systemInstruction: string) {
    const { thread, prompt } = args
    const chatHistory = thread.flatMap((t) => [
      new HumanMessage(t.prompt),
      new AIMessage(t.response),
    ])

    return [
      new SystemMessage(systemInstruction),
      ...chatHistory,
      new HumanMessage(prompt),
    ]
  }

  async *adviseStream(args: TaxStrategyType): AsyncGenerator<string> {
    const llm = this.llmService.getLLM()
    const agent = this.createAdvisorAgent(llm)
    const systemInstruction = await this.getSystemInstruction(args.user)
    const messages = this.buildMessages(args, systemInstruction)

    const eventStream = agent.streamEvents({ messages }, { version: "v2" })

    for await (const event of eventStream) {
      if (event.event === "on_chat_model_stream") {
        const content = event.data?.chunk?.content
        if (content && typeof content === "string") {
          yield content
        }
      }
    }
  }
}
