import { NestFactory } from "@nestjs/core"
import { ZodValidationPipe } from "nestjs-zod"
import { MainModule } from "./main.module"
import { INestApplication } from "@nestjs/common"

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(MainModule)
  app.useGlobalPipes(new ZodValidationPipe())
  app.enableCors({ origin: "*" })
  await app.listen(process.env.PORT || 8080)
}

bootstrap()
