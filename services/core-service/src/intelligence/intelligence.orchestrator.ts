import { Injectable } from "@nestjs/common"
import {
  BaseLanguageModelInput,
  LanguageModelOutput,
} from "@langchain/core/language_models/base"
import { RunnableInterface } from "@langchain/core/runnables"
import { createAgent, SystemMessage, HumanMessage, AIMessage } from "langchain"
import { config } from "@/config"
import { Thread } from "./schemas/thread.schema"
import { User } from "@/auth/schemas/user.schema"
import { LLMService } from "@/intelligence/llm/llm.service"
import { ConfigService } from "@/platform/config/config.service"
import { AgentRegistryService } from "@/intelligence/agent/agent.service"

type AgentLanguageModelLike = RunnableInterface<
  BaseLanguageModelInput,
  LanguageModelOutput
>

export interface ConversationArgs {
  thread: Thread[]
  prompt: string
  user: User
}

@Injectable()
export class IntelligenceOrchestrator {
  constructor(
    private readonly configService: ConfigService,
    private readonly llmService: LLMService,
    private readonly agentRegistry: AgentRegistryService
  ) {}

  private async getConversationSystemInstruction(user: User) {
    const data = await this.configService.getConfig(
      "conversation-system-instruction"
    )
    const platformConfig = await this.configService.getConfig("home-config")
    const { appConfig, solutionConfig } = platformConfig

    return data
      .replaceAll("{platformName}", config.PLATFORM_NAME)
      .replaceAll("{todaysDate}", new Date().toString())
      .replaceAll("{userDetails}", JSON.stringify(user))
      .replaceAll("{appList}", appConfig)
      .replaceAll("{solutionList}", solutionConfig)
  }

  private createConversationAgent(llm: AgentLanguageModelLike) {
    return createAgent({
      model: llm,
      tools: this.agentRegistry.getTools(),
      stateSchema: undefined,
    })
  }

  private async getSystemInstruction(args: ConversationArgs) {
    const { user } = args
    return this.getConversationSystemInstruction(user)
  }

  private buildMessages(args: ConversationArgs, systemInstruction: string) {
    const { thread, prompt } = args
    const conversationHistory = thread.flatMap((t) => [
      new HumanMessage(t.prompt),
      new AIMessage(t.response),
    ])

    return [
      new SystemMessage(systemInstruction),
      ...conversationHistory,
      new HumanMessage(prompt),
    ]
  }

  async *conversation(args: ConversationArgs): AsyncGenerator<string> {
    const llm = this.llmService.getOpenAIConversationModel()
    const conversationAgent = this.createConversationAgent(llm)
    const systemInstruction = await this.getSystemInstruction(args)
    const messages = this.buildMessages(args, systemInstruction)

    const eventStream = conversationAgent.streamEvents(
      { messages },
      { version: "v2" }
    )

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
