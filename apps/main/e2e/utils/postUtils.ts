import { INestApplication } from '@nestjs/common'
import {
	checkErrorResponse,
	deleteRequest,
	getRequest,
	postRequest,
	putRequest,
	defUserEmail,
	defUserName,
	defUserPassword,
	patchRequest,
} from './common'
import RouteNames from '../../src/routes/routesConfig/routeNames'
import { HTTP_STATUSES } from '../../src/utils/httpStatuses'
import { UserRepository } from '../../src/repositories/user.repository'
import { createUniqString, parseCookieStringToObj } from '@app/shared/utils/stringUtils'
import { DeviceTokenOutModel } from '../../src/models/auth/auth.output.model'
import { DevicesRepository } from '../../src/repositories/devices.repository'
import { JwtAdapterService } from '@app/jwt-adapter'
import { MainConfigService } from '@app/config'
import path from 'node:path'

export const postUtils = {
	async createPost(params: {
		app: INestApplication
		accessToken: string
		mainConfig: MainConfigService
		postText?: string
		postLocation?: string
	}) {
		const {
			app,
			accessToken,
			mainConfig,
			postText = 'Post description',
			postLocation = 'Photo location',
		} = params

		const avatarFilePath = path.join(__dirname, 'files/avatar.png')

		const addPostRes = await postRequest(app, RouteNames.POSTS.value)
			.set('authorization', 'Bearer ' + accessToken)
			.set('Content-Type', 'multipart/form-data')
			.attach('photoFiles', avatarFilePath)
			.attach('photoFiles', avatarFilePath)
			.field('text', postText)
			.field('location', postLocation)
			.expect(HTTP_STATUSES.CREATED_201)

		return addPostRes.body
	},
	async createPosts(params: {
		app: INestApplication
		accessToken: string
		mainConfig: MainConfigService
		refreshTokenValue: string
		count: number
	}) {
		const { app, accessToken, mainConfig, refreshTokenValue, count } = params

		const posts: any[] = []
		const avatarFilePath = path.join(__dirname, 'files/avatar.png')

		for (let i = 0; i < count; i++) {
			const addPostRes = await postRequest(app, RouteNames.POSTS.value)
				.set('authorization', 'Bearer ' + accessToken)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.set('Content-Type', 'multipart/form-data')
				.attach('photoFiles', avatarFilePath)
				.attach('photoFiles', avatarFilePath)
				.field('text', 'Post description ' + i)
				.field('location', 'Photo location ' + i)
				.expect(HTTP_STATUSES.CREATED_201)

			posts.push(addPostRes.body)
		}

		return posts
	},
}
