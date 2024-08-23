import { NestFactory } from '@nestjs/core'
import { AppModule } from './features/app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.setGlobalPrefix('backend-api')
	await app.listen(process.env.MAIN_MICROSERVICE_PORT)
}

bootstrap()
