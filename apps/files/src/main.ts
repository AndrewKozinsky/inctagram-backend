import { NestFactory } from '@nestjs/core'
import { FilesModule } from './filesModule'
import { Transport } from '@nestjs/microservices'

async function bootstrap() {
	const app = await NestFactory.createMicroservice(FilesModule, {
		transport: Transport.TCP,
		options: {
			host: '127.0.0.1',
			port: 3001,
		},
	})
	await app.listen()
}
bootstrap()
