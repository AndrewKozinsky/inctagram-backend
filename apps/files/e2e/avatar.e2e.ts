import { INestMicroservice } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import path from 'path'
import fs from 'node:fs/promises'
import { FileMS_EventNames, FileMS_SaveUserAvatarInContract } from '@app/shared'
import { Readable } from 'stream'
import { createFilesApp } from './utils/createFilesApp'
import { createEmitApp } from './utils/createEmitApp'
import { AvatarService } from '../src/avatarService'
import { PostPhotoService } from '../src/postPhotoService'
import { CommonService } from '../src/commonService'
import { clearAllDB } from './utils/db'

it('123', async () => {
	expect(2).toBe(2)
})

describe('Auth (e2e)', () => {
	let emitApp: ClientProxy
	let filesApp: INestMicroservice
	let commonService: CommonService
	let avatarService: AvatarService
	let postPhotoService: PostPhotoService

	beforeAll(async () => {
		const createFilesAppRes = await createFilesApp(
			commonService,
			avatarService,
			postPhotoService,
		)
		// emitApp = await createEmitApp()
		// filesApp = createFilesAppRes.filesApp
		// commonService = createFilesAppRes.commonService
		// avatarService = createFilesAppRes.avatarService
		// postPhotoService = createFilesAppRes.postPhotoService
	})

	beforeEach(async () => {
		// await clearAllDB(emitApp)
	})

	afterEach(() => {
		// jest.clearAllMocks()
	})

	afterAll(async () => {
		// await emitApp.close()
		// await filesApp.close()
	})

	it.only('should respond to the request', async () => {
		// commonService.s3Client.send = jest.fn().mockResolvedValueOnce('mockResponse')
		const avatarFilePath = path.join(__dirname, 'utils/files/avatar.png')
		const avatarFile = await readFileAsMulterFile(avatarFilePath)

		// Send a request to the microservice
		/*const eventName = FileMS_EventNames.SaveUserAvatar
		const payload: FileMS_SaveUserAvatarInContract = {
			userId: 2,
			avatarFile,
		}*/

		// await emitApp.send(eventName, payload).toPromise()
		// expect(commonService.s3Client.send).toBeCalledTimes(1)
	})
})

async function readFileAsMulterFile(filePath: string): Promise<Express.Multer.File> {
	const buffer = await fs.readFile(filePath) // Read the file as a buffer
	const fileStat = await fs.stat(filePath) // Get file details
	const originalname = path.basename(filePath) // Extract the original file name
	// const mimetype = 'application/octet-stream' // Default mime type (change if needed)

	const stream = new Readable()
	stream.push(buffer)
	stream.push(null) // Signal the end of the stream

	return {
		fieldname: 'file', // Default field name
		originalname: originalname, // Extracted file name
		encoding: '7bit', // Default encoding
		mimetype: 'image/png', // Mime type (adjust based on your file)
		size: fileStat.size, // Size of the file
		buffer: buffer, // Buffer of the file content
		stream: stream, // Readable stream of the buffer
		destination: '',
		filename: '',
		path: '',
	}
}
