import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { BlockListedSession } from "../schemas/blocklisted-session.schema"
import { Model } from "mongoose"
import { EntityRepository } from "@/shared/entity/entity.repository"
import { DbConnectionMap } from "@/shared/entity/entity-db-connection.map"

@Injectable()
export class BlockListedSessionRepository extends EntityRepository<BlockListedSession> {
  constructor(
    @InjectModel(BlockListedSession.name, DbConnectionMap.Platform)
    private blockListedSessionModel: Model<BlockListedSession>
  ) {
    super(blockListedSessionModel)
  }
}
