import { NestFactory } from "@nestjs/core"
import { MainModule } from "./main.module"
import { INestApplication, ValidationPipe } from "@nestjs/common"

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(MainModule)
  app.useGlobalPipes(new ValidationPipe())
  app.enableCors({ origin: "*" })
  await app.listen(process.env.PORT || 8080)
}

bootstrap()
