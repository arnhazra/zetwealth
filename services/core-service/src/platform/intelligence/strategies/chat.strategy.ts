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
import { EntityType } from "../dto/chat.dto"
import { ConfigService } from "@/platform/config/config.service"

export interface ChatArgs {
  thread: Thread[]
  prompt: string
  user: User
  entityDetails?: string
  entityType?: EntityType
  summarizeRequest?: boolean
}

export interface SummarizeArgs {
  entityType: EntityType
  entityDetails: string
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
    private readonly configService: ConfigService,
    private readonly llmService: LLMService
  ) {}

  private async getSummarizerSystemInstruction(args: SummarizeArgs) {
    const data = await this.configService.getConfig(
      "summarizer-system-instruction"
    )
    return data
      .replaceAll("{platformName}", config.PLATFORM_NAME)
      .replaceAll("{userId}", String(args.user._id))
      .replaceAll("{baseCurrency}", args.user.baseCurrency)
      .replaceAll("{entityType}", args.entityType)
      .replaceAll("{entityDetails}", args.entityDetails)
  }

  private async getChatSystemInstruction(user: User) {
    const data = await this.configService.getConfig("chat-system-instruction")
    const appConfig = await this.configService.getConfig("app-config")
    const solutionConfig = await this.configService.getConfig("solution-config")

    return data
      .replaceAll("{platformName}", config.PLATFORM_NAME)
      .replaceAll("{todaysDate}", new Date().toString())
      .replaceAll("{userDetails}", JSON.stringify(user))
      .replaceAll("{appList}", appConfig)
      .replaceAll("{solutionList}", solutionConfig)
  }

  private async runChatAgent(
    llm: ChatOpenAI<ChatOpenAICallOptions>,
    args: ChatArgs
  ) {
    const {
      thread,
      prompt,
      user,
      entityDetails,
      entityType,
      summarizeRequest,
    } = args
    let systemInstruction: string = ""

    if (!summarizeRequest) {
      systemInstruction = await this.getChatSystemInstruction(user)
    } else {
      systemInstruction = await this.getSummarizerSystemInstruction({
        user,
        entityDetails,
        entityType,
      })
    }

    const chatAgent = createAgent({
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
      ],
      stateSchema: undefined,
    })

    const chatHistory = thread.flatMap((t) => [
      new HumanMessage(t.prompt),
      new AIMessage(t.response),
    ])

    const { messages } = await chatAgent.invoke({
      messages: [
        new SystemMessage(systemInstruction),
        ...chatHistory,
        new HumanMessage(prompt),
      ],
    })

    return (
      messages[messages.length - 1]?.content?.toString?.() ??
      messages[messages.length - 1]?.content
    )
  }

  async chat(args: ChatArgs) {
    const llm = this.llmService.getLLM()
    const response = await this.runChatAgent(llm, args)
    return { response }
  }
}
