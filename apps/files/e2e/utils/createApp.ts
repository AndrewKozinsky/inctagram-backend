import { Transport } from '@nestjs/microservices'
import { Test, TestingModule } from '@nestjs/testing'
import { FilesModule } from '../../src/filesModule'

export async function createFilesApp() {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [FilesModule],
	}).compile()

	const filesApp = moduleFixture.createNestMicroservice({
		transport: Transport.TCP,
		options: {
			host: 'localhost',
			port: 5002,
		},
	})
	await filesApp.listen()

	return { filesApp }
}
