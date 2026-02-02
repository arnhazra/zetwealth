import { IQueryHandler, QueryHandler } from "@nestjs/cqrs"
import { UserRepository } from "../../repositories/user.repository"
import { FindUserByIdQuery } from "../impl/find-user-by-id.query"
import { createOrConvertObjectId } from "@/shared/entity/entity.schema"

@QueryHandler(FindUserByIdQuery)
export class FindUserByIdQueryHandler implements IQueryHandler<FindUserByIdQuery> {
  constructor(private readonly repository: UserRepository) {}

  async execute(query: FindUserByIdQuery) {
    const { userId } = query
    return await this.repository.findOne({
      _id: createOrConvertObjectId(userId),
    })
  }
}
