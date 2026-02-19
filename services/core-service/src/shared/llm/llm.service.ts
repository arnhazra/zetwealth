import { Injectable } from "@nestjs/common"
import { config } from "@/config"
import { ChatOpenAI } from "@langchain/openai"

@Injectable()
export class LLMService {
  constructor() {}

  getLLM() {
    return new ChatOpenAI({
      model: config.AI_MODEL_MODEL_NAME,
      temperature: 0.8,
      topP: 0.8,
      apiKey: config.AI_MODEL_API_KEY,
      configuration: {
        baseURL: config.AI_MODEL_DEPLOYMENT_URI,
        apiKey: config.AI_MODEL_API_KEY,
      },
    })
  }
}
