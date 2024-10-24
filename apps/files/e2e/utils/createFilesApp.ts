import { Transport } from '@nestjs/microservices'
import { Test, TestingModule } from '@nestjs/testing'
import { FilesModule } from '../../src/filesModule'
import { S3Client } from '@aws-sdk/client-s3'
import { FilesService } from '../../src/filesService'

export async function createFilesApp(filesService: FilesService) {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [FilesModule],
	})
		.overrideProvider(S3Client)
		.useValue({
			send: jest.fn().mockResolvedValue('Mocked S3Client send() method'),
		})
		.compile()

	const filesApp = moduleFixture.createNestMicroservice({
		transport: Transport.TCP,
		options: {
			host: '127.0.0.1',
			port: 8877,
		},
	})

	await filesApp.listen()

	filesService = moduleFixture.get<FilesService>(FilesService)

	return {
		filesService,
		filesApp,
	}
}
