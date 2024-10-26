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

it('123', async () => {
	expect(2).toBe(2)
})

describe('Post photos (e2e)', () => {
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
		emitApp = await createEmitApp()
		filesApp = createFilesAppRes.filesApp
		commonService = createFilesAppRes.commonService
		avatarService = createFilesAppRes.avatarService
		postPhotoService = createFilesAppRes.postPhotoService
	})

	beforeEach(async () => {
		await clearAllDB(emitApp)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	afterAll(async () => {
		await emitApp.close()
		await filesApp.close()
	})

	describe('Create post photos', () => {
		it.only('Create post photos', async () => {
			commonService.s3Client.send = jest.fn().mockResolvedValueOnce('mockResponse')

			const postId = 2
			const addPostPhotosResp = await postPhotosUtils.createPostPhotos(emitApp, postId)

			// Check response
			expect(addPostPhotosResp.length).toBe(2)
			expect(addPostPhotosResp[0].startsWith('posts/2/')).toBeTruthy()
			expect(addPostPhotosResp[1].startsWith('posts/2/')).toBeTruthy()

			// Check if s3Client.send was run for 1 time.
			expect(commonService.s3Client.send).toBeCalledTimes(2)

			// Try to get created avatar
			// const getAvatarResp = await avatarUtils.getUserAvatar(emitApp, userId)
			// expect(getAvatarResp.avatarUrl).toBe(expectedAvatarUrl)
		})
	})
})
