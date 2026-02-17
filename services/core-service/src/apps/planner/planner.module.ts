import { Module } from "@nestjs/common"
import { EntityModule } from "@/shared/entity/entity.module"
import { config } from "@/config"
import { AppsDbConnectionMap } from "@/shared/entity/entity-db-connection.map"
import { CqrsModule } from "@nestjs/cqrs"
import { EventService } from "./event.service"
import { EventController } from "./event.controller"
import { Event, EventSchema } from "./schemas/event.schema"
import { EventRepository } from "./event.repository"
import { CreateEventCommandHandler } from "./commands/handler/create-event.handler"
import { DeleteEventCommandHandler } from "./commands/handler/delete-event.handler"
import { FindEventsByUserQueryHandler } from "./queries/handler/find-event-by-user.handler"

@Module({
  imports: [
    CqrsModule,
    EntityModule.forRoot(config.APPS_DATABASE_URI, AppsDbConnectionMap.Planner),
    EntityModule.forFeature(
      [{ name: Event.name, schema: EventSchema }],
      AppsDbConnectionMap.Planner
    ),
  ],
  controllers: [EventController],
  providers: [
    EventService,
    EventRepository,
    CreateEventCommandHandler,
    DeleteEventCommandHandler,
    FindEventsByUserQueryHandler,
  ],
})
export class PlannerModule {}
