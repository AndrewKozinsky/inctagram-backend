import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { FilesModule } from './filesModule'
import { MainConfigService } from '@app/config'
import { AppModule } from '../../main/src/app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	const mainConfig = app.get(MainConfigService)
	const { port } = mainConfig.get().filesMicroService

	const filesMicroservice = await NestFactory.createMicroservice<MicroserviceOptions>(
		FilesModule,
		{
			transport: Transport.TCP,
			options: {
				host: 'localhost',
				port: port,
			},
		},
	)
	await filesMicroservice.listen()

	console.log('The FILES server has started 🔥')
}
bootstrap()
