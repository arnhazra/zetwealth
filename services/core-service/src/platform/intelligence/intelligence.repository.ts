import { Injectable } from "@nestjs/common"
import { DbConnectionMap } from "@/shared/entity/entity-db-connection.map"
import { Thread } from "./schemas/thread.schema"
import {
  EntityModel,
  EntityRepository,
  InjectEntityModel,
} from "@/shared/entity/entity.repository"

@Injectable()
export class IntelligenceRepository extends EntityRepository<Thread> {
  constructor(
    @InjectEntityModel(Thread.name, DbConnectionMap.Platform)
    private threadModel: EntityModel<Thread>
  ) {
    super(threadModel)
  }
}
