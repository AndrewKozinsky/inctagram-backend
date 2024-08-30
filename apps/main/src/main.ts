import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { INestApplication } from '@nestjs/common'
import { applyAppSettings } from './settings/applyAppSettings'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	await applyAppSettings(app)
	app.setGlobalPrefix('api/v1')
	addSwagger(app)

	await app.listen(process.env.MAIN_MICROSERVICE_PORT!)
	console.log('The server has started 🔥')
}

function addSwagger(app: INestApplication<any>) {
	const config = new DocumentBuilder()
		.setTitle('Cats example')
		.setDescription('The cats API description')
		.setVersion('1.0')
		.addTag('cats')
		.build()
	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('api/v1', app, document)
}

bootstrap()
