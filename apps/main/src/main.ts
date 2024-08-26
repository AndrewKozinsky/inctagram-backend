import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.setGlobalPrefix('api/v1')
	await app.listen(process.env.MAIN_MICROSERVICE_PORT!)
	console.log('The server has started 🔥')
}

bootstrap()
