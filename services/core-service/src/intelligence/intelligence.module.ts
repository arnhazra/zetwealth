import { Module } from "@nestjs/common"
import { IntelligenceService } from "./intelligence.service"
import { IntelligenceController } from "./intelligence.controller"
import { CqrsModule } from "@nestjs/cqrs"
import { DbConnectionMap } from "@/shared/entity/entity-db-connection.map"
import { Thread, ThreadSchema } from "./schemas/thread.schema"
import { CreateThreadCommandHandler } from "./commands/handler/create-thread.handler"
import { IntelligenceRepository } from "./intelligence.repository"
import { EntityModule } from "@/shared/entity/entity.module"
import { FetchThreadByIdQueryHandler } from "./queries/handler/fetch-thread-by-id.handler"
import { IntelligenceOrchestrator } from "./intelligence.orchestrator"
import { AuthModule } from "@/auth/auth.module"
import { config } from "@/config"
import { LLMService } from "./llm/llm.service"
import { AgentRegistryService } from "./agent/agent.service"
import { DiscoveryModule } from "@nestjs/core"
import { SkillService } from "./skill/skill.service"

@Module({
  imports: [
    DiscoveryModule,
    CqrsModule,
    AuthModule,
    EntityModule.forRoot(
      config.AZURE_COSMOS_DB_CONNECTION_STRING,
      DbConnectionMap.Intelligence
    ),
    EntityModule.forFeature(
      [{ name: Thread.name, schema: ThreadSchema }],
      DbConnectionMap.Intelligence
    ),
  ],
  controllers: [IntelligenceController],
  providers: [
    LLMService,
    AgentRegistryService,
    IntelligenceService,
    SkillService,
    IntelligenceRepository,
    IntelligenceOrchestrator,
    CreateThreadCommandHandler,
    FetchThreadByIdQueryHandler,
  ],
})
export class IntelligenceModule {}
