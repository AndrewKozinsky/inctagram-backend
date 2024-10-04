import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { MainConfigService } from '@app/config'
import { FilesModule } from './filesModule'
import { AppModule } from '../../main/src/app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.setGlobalPrefix('api/v1')
	const mainConfig = app.get(MainConfigService)

	const { port } = mainConfig.get().filesMicroService
	const host = mainConfig.get().mode === 'TEST' ? 'localhost' : '0.0.0.0'

	const filesMicroservice = await NestFactory.createMicroservice<MicroserviceOptions>(
		FilesModule,
		{
			transport: Transport.TCP,
			options: {
				host,
				port,
			},
		},
	)
	await filesMicroservice.listen()

	console.log('The FILES server has started 🔥')
}
bootstrap()
