import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Subscription } from "../schemas/subscription.schema"
import { Model } from "mongoose"
import { EntityRepository } from "@/shared/entity/entity.repository"
import { DbConnectionMap } from "@/shared/entity/entity-db-connection.map"

@Injectable()
export class SubscriptionRepository extends EntityRepository<Subscription> {
  constructor(
    @InjectModel(Subscription.name, DbConnectionMap.Platform)
    private subscriptionModel: Model<Subscription>
  ) {
    super(subscriptionModel)
  }
}
