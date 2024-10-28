import { INestMicroservice } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { createFilesApp } from './utils/createFilesApp'
import { createEmitApp } from './utils/createEmitApp'
import { AvatarService } from '../src/avatarService'
import { PostPhotoService } from '../src/postPhotoService'
import { CommonService } from '../src/commonService'
import { postPhotosUtils } from './utils/postPhotosUtils'
import { Connection } from 'mongoose'

it('123', async () => {
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

	describe('Get posts photos', () => {
		it.only('Get posts photos', async () => {
			await postPhotosUtils.createFivePostsPhotos(emitApp)

			// Try to get created post photos by additional request
			const getPostPhotos = await postPhotosUtils.getPostsPhotos(emitApp, [2, 3, 4])

			expect(getPostPhotos.length).toBe(3)

			expect(getPostPhotos[0].postId).toBe(2)
			expect(getPostPhotos[0].imagesUrls.length).toBe(1)
			expect(getPostPhotos[0].imagesUrls[0].startsWith('posts/2/')).toBeTruthy()

			expect(getPostPhotos[1].postId).toBe(3)
			expect(getPostPhotos[1].imagesUrls.length).toBe(1)
			expect(getPostPhotos[1].imagesUrls[0].startsWith('posts/3/')).toBeTruthy()

			expect(getPostPhotos[2].postId).toBe(4)
			expect(getPostPhotos[2].imagesUrls.length).toBe(1)
			expect(getPostPhotos[2].imagesUrls[0].startsWith('posts/4/')).toBeTruthy()
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