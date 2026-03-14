import { Module } from "@nestjs/common"
import { EntityModule } from "@/shared/entity/entity.module"
import { config } from "@/config"
import { AppsDbConnectionMap } from "@/shared/entity/entity-db-connection.map"
import { DebtService } from "./debt.service"
import { DebtController } from "./debt.controller"
import { CqrsModule } from "@nestjs/cqrs"
import { Debt, DebtSchema } from "./schemas/debt.schema"
import { DebtRepository } from "./debt.repository"
import { CreateDebtCommandHandler } from "./commands/handler/create-debt.handler"
import { DeleteDebtCommandHandler } from "./commands/handler/delete-debt.handler"
import { FindDebtByIdQueryHandler } from "./queries/handler/find-debt-by-id.handler"
import { UpdateDebtCommandHandler } from "./commands/handler/update-debt.handler"
import { FindDebtsByUserQueryHandler } from "./queries/handler/find-debt-by-user.handler"

@Module({
  imports: [
    CqrsModule,
    EntityModule.forRoot(
      config.AZURE_COSMOS_DB_CONNECTION_STRING,
      AppsDbConnectionMap.DebtTrack
    ),
    EntityModule.forFeature(
      [{ name: Debt.name, schema: DebtSchema }],
      AppsDbConnectionMap.DebtTrack
    ),
  ],
  controllers: [DebtController],
  providers: [
    DebtService,
    DebtRepository,
    CreateDebtCommandHandler,
    UpdateDebtCommandHandler,
    DeleteDebtCommandHandler,
    FindDebtsByUserQueryHandler,
    FindDebtByIdQueryHandler,
  ],
})
export class DebtTrackModule {}
