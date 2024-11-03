import { ClientProxyFactory, Transport } from '@nestjs/microservices'

export async function createEmitApp() {
	// Create a client proxy to communicate with the microservice
	const emitApp = ClientProxyFactory.create({
		transport: Transport.TCP,
		options: {
			host: '127.0.0.1',
			port: 8877,
		},
	})

	await emitApp.connect()

	return emitApp
}
