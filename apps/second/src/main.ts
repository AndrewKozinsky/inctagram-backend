import { NestFactory } from '@nestjs/core';
import { SecondModule } from './second.module';

async function bootstrap() {
  const app = await NestFactory.create(SecondModule);
  await app.listen(3000);
}
bootstrap();
