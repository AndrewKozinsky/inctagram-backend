import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices'
import { Test, TestingModule } from '@nestjs/testing'
import { FilesModule } from '../../src/filesModule'
import { INestMicroservice, Module } from '@nestjs/common'

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

export async function createFilesApp() {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [FilesModule],
	}).compile()

	const filesApp = moduleFixture.createNestMicroservice({
		transport: Transport.TCP,
		options: {
			host: '127.0.0.1',
			port: 8877,
		},
	})

	await filesApp.listen()

	return filesApp
}
