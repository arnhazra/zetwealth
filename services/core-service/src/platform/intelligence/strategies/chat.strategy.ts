import { Injectable } from "@nestjs/common"
import { Thread } from "../schemas/thread.schema"
import { config } from "@/config"
import { ChatOpenAI, ChatOpenAICallOptions } from "@langchain/openai"
import { createAgent, SystemMessage, HumanMessage, AIMessage } from "langchain"
import { User } from "@/auth/schemas/user.schema"
import { GoalAgent } from "../agents/goal.agent"
import { AssetGroupAgent } from "../agents/assetgroup.agent"
import { AssetAgent } from "../agents/asset.agent"
import { DebtAgent } from "../agents/debt.agent"
import { ExpenseAgent } from "../agents/expense.agent"
import { LLMService } from "@/shared/llm/llm.service"
import { CashflowAgent } from "../agents/cashflow.agent"
import { ConfigService } from "@/platform/config/config.service"
import { EventAgent } from "../agents/event.agent"

export interface ChatArgs {
  thread: Thread[]
  prompt: string
  user: User
}

@Injectable()
export class ChatStrategy {
  constructor(
    private readonly assetgroupAgent: AssetGroupAgent,
    private readonly assetAgent: AssetAgent,
    private readonly goalAgent: GoalAgent,
    private readonly debtAgent: DebtAgent,
    private readonly expenseAgent: ExpenseAgent,
    private readonly cashflowAgent: CashflowAgent,
    private readonly eventAgent: EventAgent,
    private readonly configService: ConfigService,
    private readonly llmService: LLMService
  ) {}

  private async getChatSystemInstruction(user: User) {
    const data = await this.configService.getConfig("chat-system-instruction")
    const platformConfig = await this.configService.getConfig("home-config")
    const { appConfig, solutionConfig } = platformConfig

    return data
      .replaceAll("{platformName}", config.PLATFORM_NAME)
      .replaceAll("{todaysDate}", new Date().toString())
      .replaceAll("{userDetails}", JSON.stringify(user))
      .replaceAll("{appList}", appConfig)
      .replaceAll("{solutionList}", solutionConfig)
  }

  private createChatAgent(llm: ChatOpenAI<ChatOpenAICallOptions>) {
    return createAgent({
      model: llm,
      tools: [
        this.assetgroupAgent.createAssetGroupTool,
        this.assetgroupAgent.getAssetGroupValuationTool,
        this.assetgroupAgent.getAssetGroupListTool,
        this.assetAgent.getAssetTypesTool,
        this.assetAgent.getTotalAssetTool,
        this.assetAgent.getAssetListTool,
        this.goalAgent.createGoalTool,
        this.goalAgent.getGoalListTool,
        this.goalAgent.getNearestGoalTool,
        this.debtAgent.createDebtTool,
        this.debtAgent.getTotalDebtTool,
        this.debtAgent.getDebtListTool,
        this.expenseAgent.getExpenseByMonthTool,
        this.expenseAgent.createExpenseTool,
        this.cashflowAgent.getCashflowsByUserIdTool,
        this.eventAgent.createEventTool,
        this.eventAgent.getEventByMonthTool,
      ],
      stateSchema: undefined,
    })
  }

  private async getSystemInstruction(args: ChatArgs) {
    const { user } = args
    return this.getChatSystemInstruction(user)
  }

  private buildMessages(args: ChatArgs, systemInstruction: string) {
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

  async *chatStream(args: ChatArgs): AsyncGenerator<string> {
    const llm = this.llmService.getLLM()
    const chatAgent = this.createChatAgent(llm)
    const systemInstruction = await this.getSystemInstruction(args)
    const messages = this.buildMessages(args, systemInstruction)

    const eventStream = chatAgent.streamEvents({ messages }, { version: "v2" })

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
