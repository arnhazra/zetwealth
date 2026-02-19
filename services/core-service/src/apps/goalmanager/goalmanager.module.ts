import { Module } from "@nestjs/common"
import { GoalService } from "./goal.service"
import { GoalController } from "./goal.controller"
import { CqrsModule } from "@nestjs/cqrs"
import { Goal, GoalSchema } from "./schemas/goal.schema"
import { AppsDbConnectionMap } from "@/shared/entity/entity-db-connection.map"
import { GoalRepository } from "./goal.repository"
import { CreateGoalCommandHandler } from "./commands/handler/create-goal.handler"
import { DeleteGoalCommandHandler } from "./commands/handler/delete-goal.handler"
import { FindGoalByIdQueryHandler } from "./queries/handler/find-goal-by-id.handler"
import { EntityModule } from "@/shared/entity/entity.module"
import { UpdateGoalCommandHandler } from "./commands/handler/update-goal.handler"
import { FindGoalsByUserQueryHandler } from "./queries/handler/find-goal-by-user.handler"
import { FindNearestGoalQueryHandler } from "./queries/handler/find-nearest-goal.handler"
import { config } from "@/config"

@Module({
  imports: [
    CqrsModule,
    EntityModule.forRoot(
      config.APPS_DATABASE_URI,
      AppsDbConnectionMap.GoalManager
    ),
    EntityModule.forFeature(
      [{ name: Goal.name, schema: GoalSchema }],
      AppsDbConnectionMap.GoalManager
    ),
  ],
  controllers: [GoalController],
  providers: [
    GoalService,
    GoalRepository,
    CreateGoalCommandHandler,
    UpdateGoalCommandHandler,
    DeleteGoalCommandHandler,
    FindGoalsByUserQueryHandler,
    FindGoalByIdQueryHandler,
    FindNearestGoalQueryHandler,
  ],
})
export class GoalManagerModule {}
