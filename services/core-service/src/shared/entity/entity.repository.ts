import {
  Model as EntityModel,
  Document,
  QueryFilter,
  UpdateQuery,
  PipelineStage,
} from "mongoose"
import { InjectModel as InjectEntityModel } from "@nestjs/mongoose"

export abstract class EntityRepository<T extends Document> {
  constructor(protected readonly entityModel: EntityModel<T>) {}

  findOne(entityFilterQuery: QueryFilter<T>): Promise<T | null> {
    return this.entityModel.findOne(entityFilterQuery)
  }

  find(entityFilterQuery: QueryFilter<T> = {}) {
    return this.entityModel.find(entityFilterQuery)
  }

  countDocuments(entityFilterQuery: QueryFilter<T> = {}) {
    return this.entityModel.countDocuments(entityFilterQuery)
  }

  async create(createEntityDto: Partial<T>): Promise<T> {
    const createdDocument = new this.entityModel(createEntityDto)
    return await createdDocument.save()
  }

  async update(
    entityFilterQuery: QueryFilter<T>,
    updateEntityDto: UpdateQuery<T>
  ): Promise<T | null> {
    return await this.entityModel
      .findOneAndUpdate(entityFilterQuery, updateEntityDto, {
        returnDocument: "after",
      })
      .exec()
  }

  async delete(entityFilterQuery: QueryFilter<T>): Promise<T | null> {
    return await this.entityModel.findOneAndDelete(entityFilterQuery).exec()
  }

  async deleteMany(entityFilterQuery: QueryFilter<T>): Promise<any> {
    return await this.entityModel.deleteMany(entityFilterQuery).exec()
  }

  async aggregate<R = any>(pipeline: PipelineStage[]): Promise<R[]> {
    return this.entityModel.aggregate(pipeline).exec()
  }
}

export { EntityModel, InjectEntityModel }
