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
import { avatarUtils } from './utils/avatarUtils'
import { postPhotosUtils } from './utils/postPhotosUtils'
import { Connection } from 'mongoose'
import { UserAvatar } from '../src/schemas/userAvatar.schema'

it.only('123', async () => {
	expect(2).toBe(2)
})

describe('Post photos (e2e)', () => {
	let emitApp: ClientProxy
	let filesApp: INestMicroservice
	let commonService: CommonService
	let avatarService: AvatarService
	let postPhotoService: PostPhotoService
	let mongoConnection: Connection

	beforeAll(async () => {
		const createFilesAppRes = await createFilesApp(
			commonService,
			avatarService,
			postPhotoService,
			mongoConnection,
		)
		emitApp = await createEmitApp()
		filesApp = createFilesAppRes.filesApp
		commonService = createFilesAppRes.commonService
		avatarService = createFilesAppRes.avatarService
		postPhotoService = createFilesAppRes.postPhotoService
		mongoConnection = createFilesAppRes.mongoConnection
	})

	beforeEach(async () => {
		await mongoConnection.dropDatabase()
	})

	afterEach(async () => {
		jest.clearAllMocks()
	})

	afterAll(async () => {
		await emitApp.close()
		await filesApp.close()
		await mongoConnection.close()
	})

	describe('Create post photos', () => {
		it('Create post photos', async () => {
			commonService.s3Client.send = jest.fn().mockResolvedValueOnce('mockResponse')

			const postId = 2
			const addPostPhotosResp = await postPhotosUtils.createPostPhotos(emitApp, postId)

			// Check response
			expect(addPostPhotosResp.length).toBe(2)
			expect(addPostPhotosResp[0].startsWith('posts/2/')).toBeTruthy()
			expect(addPostPhotosResp[1].startsWith('posts/2/')).toBeTruthy()

			// Check if s3Client.send was run for 1 time.
			expect(commonService.s3Client.send).toBeCalledTimes(2)

			// Try to get created post photos details in database
			const postPhotosCollection = mongoConnection.collection('postphotos')
			const postPhotosFromDB = await postPhotosCollection.find({ postId }).toArray()

			// Check post photos details from database
			expect(postPhotosFromDB.length).toBe(2)
			expect(postPhotosFromDB[0].postId).toBe(2)
			expect(postPhotosFromDB[0].url.startsWith('posts/2/')).toBeTruthy()

			// Try to get created post photos by additional request
			const getPostPhotosResp = await postPhotosUtils.getPostPhotos(emitApp, postId)
			expect(getPostPhotosResp.length).toBe(2)
			expect(getPostPhotosResp[0]).toBe(postPhotosFromDB[0].url)
			expect(getPostPhotosResp[1]).toBe(postPhotosFromDB[1].url)
		})
	})

	describe('Get post photos', () => {
		it('Get post photos', async () => {
			const postId = 2
			const addPostPhotosResp = await postPhotosUtils.createPostPhotos(emitApp, postId)

			// Try to get created post photos by additional request
			const getPostPhotosResp = await postPhotosUtils.getPostPhotos(emitApp, postId)
			expect(getPostPhotosResp.length).toBe(2)
			expect(getPostPhotosResp[0]).toBe(addPostPhotosResp[0])
			expect(getPostPhotosResp[1]).toBe(addPostPhotosResp[1])
		})
	})

	describe('Delete post photos', () => {
		it('Get post photos', async () => {
			const postId = 2
			await postPhotosUtils.createPostPhotos(emitApp, postId)

			await postPhotosUtils.deletePostPhotos(emitApp, postId)

			// Try to get deleted post photos by additional request
			const getPostPhotosResp = await postPhotosUtils.getPostPhotos(emitApp, postId)
			expect(getPostPhotosResp.length).toBe(0)

			// Try to get created post photos details in database
			const postPhotosCollection = mongoConnection.collection('postphotos')
			const postPhotosFromDB = await postPhotosCollection.find({ postId }).toArray()

			// Check post photos details from database
			expect(postPhotosFromDB.length).toBe(0)
		})
	})
})
