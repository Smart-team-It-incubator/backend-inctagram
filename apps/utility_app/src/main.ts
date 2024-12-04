import { NestFactory } from '@nestjs/core';
import { UtilityAppModule } from './utility_app.module';

async function bootstrap() {
  const app = await NestFactory.create(UtilityAppModule);
  await app.listen(process.env.port ?? 3001);
}
bootstrap();
