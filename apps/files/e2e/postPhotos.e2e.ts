import { INestMicroservice } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { createFilesApp } from './utils/createFilesApp'
import { createEmitApp } from './utils/createEmitApp'
import { AvatarService } from '../src/avatarService'
import { PostPhotoService } from '../src/postPhotoService'
import { CommonService } from '../src/commonService'
import { postPhotosUtils } from './utils/postPhotosUtils'
import { Connection } from 'mongoose'
import path from 'path'
import { ObjectId } from 'mongodb'

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

	describe('Create post photo', () => {
		it('Create post photo', async () => {
			commonService.s3Client.send = jest.fn().mockResolvedValueOnce('mockResponse')

			const addPostPhoto = await postPhotosUtils.createPostPhoto(emitApp) // { imageId: '6720e8d0e08e0deb98875b92' }

			// Check response
			expect(typeof addPostPhoto.photoId).toBe('string')
		})
	})

	describe('Get post photos', () => {
		it('Get post photos', async () => {
			const postPhoto1Path = path.join(__dirname, 'utils/files/post-photo-1.jpeg')
			const addPostPhoto1 = await postPhotosUtils.createPostPhoto(emitApp, postPhoto1Path)

			const postPhoto2Path = path.join(__dirname, 'utils/files/post-photo-2.png')
			const addPostPhoto2 = await postPhotosUtils.createPostPhoto(emitApp, postPhoto2Path)

			// Try to get created post photos by additional request
			const getPostPhotos = await postPhotosUtils.getPostPhotos(emitApp, [
				addPostPhoto1.photoId,
				addPostPhoto2.photoId,
			])
			/*[
				{
					id: '6720f5423e64f0e5b06dd530',
					url: 'posts/0e58c10b-aaed-401b-a797-35b2a4128f08.jpeg',
				},
				{
					id: '6720f5423e64f0e5b06dd532',
					url: 'posts/13d38ff0-b9f5-4517-925f-47aa4ff29e4d.png',
				},
			]*/

			expect(getPostPhotos.length).toBe(2)

			expect(getPostPhotos[0].id).toBe(addPostPhoto1.photoId)
			expect(getPostPhotos[0].url.startsWith('postPhotos/')).toBeTruthy()

			expect(getPostPhotos[1].id).toBe(addPostPhoto2.photoId)
			expect(getPostPhotos[1].url.startsWith('postPhotos/')).toBeTruthy()
		})
	})

	describe('Delete post photo', () => {
		it('Get post photo', async () => {
			const addPostPhoto = await postPhotosUtils.createPostPhoto(emitApp)

			await postPhotosUtils.deletePostPhoto(emitApp, addPostPhoto.photoId)

			const getPostPhotos = await postPhotosUtils.getPostPhotos(emitApp, [
				addPostPhoto.photoId,
			])
			expect(getPostPhotos.length).toBe(0)

			// Try to get created post photos details in database
			const postPhotosCollection = mongoConnection.collection('postphotos')

			// Check post photos from database
			const postPhotosFromDB = await postPhotosCollection
				.find({ _id: new ObjectId(addPostPhoto.photoId) })
				.toArray()
			expect(postPhotosFromDB.length).toBe(0)
		})
	})
})
