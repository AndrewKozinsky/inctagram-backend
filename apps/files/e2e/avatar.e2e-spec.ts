import { INestMicroservice } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import path from 'path'
import fs from 'node:fs/promises'
import { FileMS_EventNames, FileMS_SaveUserAvatarInContract } from '@app/shared'
import { Readable } from 'stream'
import { S3Client } from '@aws-sdk/client-s3'
import { createFilesApp, createEmitApp } from './utils/createEmitAppAndFilesApp'

it('123', async () => {
	expect(2).toBe(2)
})

describe('Auth (e2e)', () => {
	let emitApp: ClientProxy
	let filesApp: INestMicroservice
	let s3Client: S3Client

	beforeAll(async () => {
		const createFilesAppRes = await createFilesApp(s3Client)
		filesApp = createFilesAppRes.filesApp
		s3Client = createFilesAppRes.s3Client

		emitApp = await createEmitApp()
	})

	beforeEach(async () => {})

	afterEach(() => {
		jest.clearAllMocks()
	})

	afterAll(async () => {
		await emitApp.close()
		await filesApp.close()
	})

	it.only('should respond to the request', async () => {
		const avatarFilePath = path.join(__dirname, 'utils/files/avatar.png')

		const avatarFile = await readFileAsMulterFile(avatarFilePath)

		// Send a request to the microservice
		const eventName = FileMS_EventNames.SaveUserAvatar
		const payload: FileMS_SaveUserAvatarInContract = {
			userId: 2,
			avatarFile,
		}

		const response = await emitApp.send(eventName, payload).toPromise()
		expect(s3Client.send).toBeCalledTimes(1)
	})
})

/*function bufferToMulterFile(params: {
	buffer: Buffer
	originalName: string
	mimeType: string
}): Express.Multer.File {
	const stream = new Readable()
	stream.push(params.buffer)
	stream.push(null) // Signals the end of the stream

	return {
		fieldname: 'file', // Name of the field that this file is attached to
		originalname: params.originalName, // The original file name (e.g., 'image.png')
		encoding: '7bit', // Encoding type (can be based on your requirements)
		mimetype: params.mimeType, // Mime type (e.g., 'image/png')
		size: params.buffer.length, // File size based on the buffer length
		buffer: params.buffer, // The actual buffer data

		stream,
		destination: '',
		filename: '',
		path: '',
	}
}*/

async function readFileAsMulterFile(filePath: string): Promise<Express.Multer.File> {
	const buffer = await fs.readFile(filePath) // Read the file as a buffer
	const fileStat = await fs.stat(filePath) // Get file details
	const originalname = path.basename(filePath) // Extract the original file name
	const mimetype = 'application/octet-stream' // Default mime type (change if needed)

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
