import {
  Schema as NestSchema,
  SchemaFactory,
  SchemaOptions,
  Prop as EntityProp,
} from "@nestjs/mongoose"
import { Document, Types, QueryFilter } from "mongoose"

export abstract class IdentifiableEntitySchema extends Document {}

const DEFAULT_SCHEMA_OPTIONS: SchemaOptions = {
  versionKey: false,
  timestamps: { createdAt: true, updatedAt: false },
}

export const Entity = (opts?: SchemaOptions) =>
  NestSchema({ ...DEFAULT_SCHEMA_OPTIONS, ...(opts || {}) })

export function createSchemaFromClass<T>(cls: new () => T) {
  const schema = SchemaFactory.createForClass(cls as any)
  return schema
}

export function createOrConvertObjectId(param?: string) {
  return new Types.ObjectId(param)
}

export { EntityProp, QueryFilter }
export type ObjectId = Types.ObjectId
export const ObjectIdType = Types.ObjectId
