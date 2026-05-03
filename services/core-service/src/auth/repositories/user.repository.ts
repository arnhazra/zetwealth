import { Injectable } from "@nestjs/common"
import { User } from "../schemas/user.schema"
import { DbConnectionMap } from "@/shared/entity/entity-db-connection.map"
import {
  EntityModel,
  EntityRepository,
  InjectEntityModel,
} from "@/shared/entity/entity.repository"

@Injectable()
export class UserRepository extends EntityRepository<User> {
  constructor(
    @InjectEntityModel(User.name, DbConnectionMap.Auth)
    private userModel: EntityModel<User>
  ) {
    super(userModel)
  }
}
