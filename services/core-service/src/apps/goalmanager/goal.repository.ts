import { Injectable } from "@nestjs/common"
import { Goal } from "./schemas/goal.schema"
import { AppsDbConnectionMap } from "@/shared/entity/entity-db-connection.map"
import {
  EntityModel,
  EntityRepository,
  InjectEntityModel,
} from "@/shared/entity/entity.repository"

@Injectable()
export class GoalRepository extends EntityRepository<Goal> {
  constructor(
    @InjectEntityModel(Goal.name, AppsDbConnectionMap.GoalManager)
    private goalModel: EntityModel<Goal>
  ) {
    super(goalModel)
  }
}
