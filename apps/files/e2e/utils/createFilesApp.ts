import { Transport } from '@nestjs/microservices'
import { Test, TestingModule } from '@nestjs/testing'
import { FilesModule } from '../../src/filesModule'
import { S3Client } from '@aws-sdk/client-s3'

export async function createFilesApp(s3Client: S3Client) {
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

	s3Client = moduleFixture.get<S3Client>(S3Client)

	return {
		s3Client,
		filesApp,
	}
}
