import { Injectable } from "@nestjs/common"
import { config } from "@/config"
import { ChatOpenAI } from "@langchain/openai"

@Injectable()
export class LLMService {
  constructor() {}

  getOpenAIConversationModel() {
    return new ChatOpenAI({
      model: config.AZURE_OPENAI_MODEL_NAME,
      temperature: 0.4,
      topP: 0.8,
      apiKey: config.AZURE_OPENAI_API_KEY,
      configuration: {
        baseURL: config.AZURE_OPENAI_DEPLOYMENT_URI,
        apiKey: config.AZURE_OPENAI_API_KEY,
      },
    })
  }
}
