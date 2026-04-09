import { Module, DynamicModule } from "@nestjs/common"
import { DbConnectionMapType } from "@/shared/entity/entity-db-connection.map"
import { ModelDefinition, MongooseModule } from "@nestjs/mongoose"

@Module({})
export class EntityModule {
  static forRoot(
    uri: string,
    dbConnectionName: DbConnectionMapType
  ): DynamicModule {
    return MongooseModule.forRootAsync({
      useFactory: () => ({
        uri,
        dbName: dbConnectionName,
      }),
      connectionName: dbConnectionName,
    })
  }

  static forFeature(
    models: ModelDefinition[],
    dbConnectionName: DbConnectionMapType
  ): DynamicModule {
    return MongooseModule.forFeature(models, dbConnectionName)
  }
}
