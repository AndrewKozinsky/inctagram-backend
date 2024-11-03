import { Transport } from '@nestjs/microservices'
import { Test, TestingModule } from '@nestjs/testing'
import { connect, Connection } from 'mongoose'
import { FilesModule } from '../../src/filesModule'
import { AvatarService } from '../../src/avatarService'
import { PostPhotoService } from '../../src/postPhotoService'
import { CommonService } from '../../src/commonService'

export async function createFilesApp(
	commonService: CommonService,
	avatarService: AvatarService,
	postPhotoService: PostPhotoService,
	mongoConnection: Connection,
) {
	const uri = process.env.MONGO_DB_URL || 'mongodb://localhost:27017/files'
	mongoConnection = (await connect(uri)).connection

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

	commonService = moduleFixture.get(CommonService)
	jest.spyOn(commonService, 'saveFile').mockImplementation(() => Promise.resolve())
	jest.spyOn(commonService, 'deleteFile').mockImplementation(() => Promise.resolve())

	await filesApp.listen()

	commonService = moduleFixture.get<CommonService>(CommonService)
	avatarService = moduleFixture.get<AvatarService>(AvatarService)
	postPhotoService = moduleFixture.get<PostPhotoService>(PostPhotoService)

	return {
		commonService,
		avatarService,
		postPhotoService,
		filesApp,
		mongoConnection,
	}
}
