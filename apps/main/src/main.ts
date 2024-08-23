import { NestFactory } from '@nestjs/core'
import { AppModule } from './features/app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.setGlobalPrefix('api/v1')
	await app.listen(process.env.MAIN_MICROSERVICE_PORT)
	console.log('MAIN_MICROSERVICE_PORT:', process.env.MAIN_MICROSERVICE_PORT)
	console.log('some')
}

bootstrap()
