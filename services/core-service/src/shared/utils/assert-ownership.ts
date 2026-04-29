import { ForbiddenException } from "@nestjs/common"
import { statusMessages } from "../constants/status-messages"
import { ObjectId } from "../entity/entity.schema"

interface Ownable {
  userId: ObjectId
}

export function assertOwnership(resource: Ownable, userId: string) {
  if (String(resource.userId) !== userId) {
    throw new ForbiddenException(statusMessages.forbidden)
  }
}
