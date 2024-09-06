import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { INestApplication } from '@nestjs/common'
import { applyAppSettings } from './infrastructure/applyAppSettings'

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { cors: false })
	await applyAppSettings(app)
	app.setGlobalPrefix('api/v1')
	addSwagger(app)

	await app.listen(process.env.MAIN_MICROSERVICE_PORT!)
	console.log('The server has started 🔥')
}

function addSwagger(app: INestApplication<any>) {
	/*const configSwagger = new DocumentBuilder()
		.setTitle('Inctagram API')
		.setDescription('The Inctagram API')
		.setVersion('1.0')
		/!*.addSecurity('basic', {
			type: 'http',
			scheme: 'basic',
		})*!/
		/!*.addSecurity('refreshToken', {
			type: 'http',
			scheme: 'bearer',
			bearerFormat: 'JWT',
			in: 'cookie',
			name: 'refreshToken',
		})*!/
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'Token',
			},
			'access-token',
		)
		.addCookieAuth('refreshToken', {
			type: 'apiKey',
			in: 'cookie',
			name: 'refreshToken',
		})
		.build()*/

	const configSwagger = new DocumentBuilder()
		.setTitle('Trainee platform')
		.setDescription('The trainee platform API description')
		.setVersion('1.0')
		.addApiKey(
			{
				type: 'apiKey',
				name: 'token',
				in: 'header',
				description: 'Token for crm',
			},
			'crm-user-token',
		)
		.addApiKey(
			{
				type: 'apiKey',
				name: 'token',
				in: 'header',
				description: 'token for public api',
			},
			'trainee-token',
		)
		.addApiKey(
			{
				type: 'apiKey',
				in: 'header',
				name: 'friend-token',
				description: 'token for friend api',
			},
			'friend-token',
		)
		// .addCookieAuth('optional-session-id')
		.build()

	const document = SwaggerModule.createDocument(app, configSwagger)
	SwaggerModule.setup('api/v1', app, document)
}

bootstrap()
