import { INestMicroservice } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { createFilesApp } from './utils/createFilesApp'
import { createEmitApp } from './utils/createEmitApp'
import { AvatarService } from '../src/avatarService'
import { PostPhotoService } from '../src/postPhotoService'
import { CommonService } from '../src/commonService'
import { avatarUtils } from './utils/avatarUtils'
import { Connection } from 'mongoose'

it.only('123', async () => {
	expect(2).toBe(2)
})

describe('User avatar (e2e)', () => {
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

	describe('Create user avatar', () => {
		it('Create user avatar', async () => {
			commonService.s3Client.send = jest.fn().mockResolvedValueOnce('mockResponse')

			const userId = 2
			const addAvatarResp = await avatarUtils.createUserAvatar(emitApp, userId)

			// Check response
			const expectedAvatarUrl = 'users/2/avatar.png'
			expect(typeof addAvatarResp.avatarId).toBe('string')
			expect(addAvatarResp.avatarUrl).toBe(expectedAvatarUrl)

			// Check if s3Client.send was run for 1 time.
			expect(commonService.s3Client.send).toBeCalledTimes(1)

			// Try to get created avatar
			const getAvatarResp = await avatarUtils.getUserAvatar(emitApp, userId)
			expect(getAvatarResp.avatarUrl).toBe(expectedAvatarUrl)
		})
	})

	describe('Get users avatars', () => {
		it('Get users avatars', async () => {
			await avatarUtils.createFiveUsersAvatars(emitApp)

			// Try to get created users avatars by additional request
			const getPostPhotos = await avatarUtils.getUsersAvatars(emitApp, [2, 3, 4])
			expect(getPostPhotos.length).toBe(3)

			expect(getPostPhotos[0].userId).toBe(2)
			expect(getPostPhotos[0].avatarUrl.startsWith('users/2/')).toBeTruthy()

			expect(getPostPhotos[1].userId).toBe(3)
			expect(getPostPhotos[1].avatarUrl.startsWith('users/3/')).toBeTruthy()

			expect(getPostPhotos[2].userId).toBe(4)
			expect(getPostPhotos[2].avatarUrl.startsWith('users/4/')).toBeTruthy()
		})
	})

	describe('Get user avatar', () => {
		it('Get not exist user avatar', async () => {
			// Try to get created avatar
			const getAvatarResp = await avatarUtils.getUserAvatar(emitApp, 99)
			expect(getAvatarResp.avatarUrl).toBe(null)
		})

		it('Get existing user avatar', async () => {
			const userId = 20

			await avatarUtils.createUserAvatar(emitApp, userId)

			// Try to get created avatar
			const getAvatarResp = await avatarUtils.getUserAvatar(emitApp, userId)
			expect(getAvatarResp.avatarUrl).toBe('users/20/avatar.png')
		})
	})

	describe('Delete user avatar', () => {
		it('Delete not exist user avatar', async () => {
			commonService.s3Client.send = jest.fn().mockResolvedValueOnce('mockResponse')

			// Try to get created avatar
			await avatarUtils.deleteUserAvatar(emitApp, 99)

			// Expect s3Client.send was not called
			expect(commonService.s3Client.send).toBeCalledTimes(0)
		})
		it('Delete existing user avatar', async () => {
			commonService.s3Client.send = jest.fn().mockResolvedValueOnce('mockResponse')

			await avatarUtils.createUserAvatar(emitApp, 2)

			// Expect s3Client.send was not called
			expect(commonService.s3Client.send).toBeCalledTimes(1)
		})
	})
})
