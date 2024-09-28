import { INestApplication, INestMicroservice } from '@nestjs/common'
import { JwtAdapterService } from '@app/jwt-adapter'
import { MainConfigService } from '@app/config'
import {
	checkErrorResponse,
	checkSuccessResponse,
	deleteRequest,
	getRequest,
	postRequest,
	userEmail,
	userName,
	userPassword,
} from './utils/common'
import RouteNames from '../src/routes/routesConfig/routeNames'
import { HTTP_STATUSES } from '../src/utils/httpStatuses'
import { clearAllDB } from './utils/db'
import { EmailAdapterService } from '@app/email-adapter'
import { UserRepository } from '../src/repositories/user.repository'
import { userUtils } from './utils/userUtils'
import { parseCookieStringToObj } from '../src/utils/stringUtils'
import { GitHubService } from '../src/routes/auth/gitHubService'
import { GoogleService } from '../src/routes/auth/googleService'
import { DevicesRepository } from '../src/repositories/devices.repository'
import { ReCaptchaAdapterService } from '@app/re-captcha-adapter'
import path from 'node:path'
import { createFilesApp, createMainApp } from './utils/createMainApp'

it.only('123', async () => {
	expect(2).toBe(2)
})

describe('Auth (e2e)', () => {
	let filesApp: INestMicroservice = 1 as any
	let mainApp: INestApplication = 1 as any

	let emailAdapter: EmailAdapterService
	let gitHubService: GitHubService
	let googleService: GoogleService
	let reCaptchaAdapter: ReCaptchaAdapterService
	let userRepository: UserRepository
	let securityRepository: DevicesRepository
	let jwtService: JwtAdapterService
	let mainConfig: MainConfigService

	beforeAll(async () => {
		const createFilesAppRes = await createFilesApp()
		filesApp = createFilesAppRes.filesApp

		const createMainAppRes = await createMainApp(
			emailAdapter,
			gitHubService,
			googleService,
			reCaptchaAdapter,
		)

		mainApp = createMainAppRes.mainApp

		emailAdapter = createMainAppRes.emailAdapter
		gitHubService = createMainAppRes.gitHubService
		googleService = createMainAppRes.googleService
		reCaptchaAdapter = createMainAppRes.reCaptchaAdapter

		userRepository = await mainApp.resolve(UserRepository)
		securityRepository = await mainApp.resolve(DevicesRepository)
		jwtService = await mainApp.resolve(JwtAdapterService)
		mainConfig = await mainApp.resolve(MainConfigService)
	})

	beforeEach(async () => {
		await clearAllDB(mainApp)
	})

	afterEach(async () => {
		jest.clearAllMocks()
		await filesApp.close()
	})

	describe('Add avatar file to the current user', () => {
		it('should return 401 if there is not cookies', async () => {
			await userUtils.deviceTokenChecks.tokenNotExist(
				mainApp,
				'post',
				RouteNames.USERS.ME.AVATAR.full,
			)
		})

		it('should return 401 if the JWT refreshToken inside cookie is missing, expired or incorrect', async () => {
			await userUtils.deviceTokenChecks.tokenExpired(
				mainApp,
				'post',
				RouteNames.USERS.ME.AVATAR.full,
				userRepository,
				securityRepository,
				jwtService,
				mainConfig,
			)
		})

		it('should return 400 if the JWT refreshToken inside cookie is valid, but avatar was not send', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin(
				mainApp,
				userRepository,
				userName,
				userEmail,
				userPassword,
			)

			const refreshTokenValue = parseCookieStringToObj(refreshTokenStr).cookieValue

			const addAvatarRes = await postRequest(mainApp, RouteNames.USERS.ME.AVATAR.full)
				.set('authorization', 'Bearer ' + accessToken)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.expect(HTTP_STATUSES.BAD_REQUEST_400)

			checkErrorResponse(addAvatarRes.body, 400, 'File not found')
		})

		it('should return 400 if the JWT refreshToken inside cookie is valid, but send wrong file', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin(
				mainApp,
				userRepository,
				userName,
				userEmail,
				userPassword,
			)

			const refreshTokenValue = parseCookieStringToObj(refreshTokenStr).cookieValue

			// Send file in invalid format
			const textFilePath = path.join(__dirname, 'utils/files/text.txt')

			const addAvatarRes1 = await postRequest(mainApp, RouteNames.USERS.ME.AVATAR.full)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.set('Content-Type', 'multipart/form-data')

				.attach('avatarFile', textFilePath)
				.expect(HTTP_STATUSES.BAD_REQUEST_400)

			checkErrorResponse(addAvatarRes1.body, 400, 'File has wrong mime type')

			// Send too large image
			const bigFilePath = path.join(__dirname, 'utils/files/big-avatar.png')

			const addAvatarRes2 = await postRequest(mainApp, RouteNames.USERS.ME.AVATAR.full)
				.set('authorization', 'Bearer ' + accessToken)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.set('Content-Type', 'multipart/form-data')

				.attach('avatarFile', bigFilePath)
				.expect(HTTP_STATUSES.BAD_REQUEST_400)

			checkErrorResponse(addAvatarRes2.body, 400, 'File is too large')
		})

		it('should return 200 if send correct avatar image', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin(
				mainApp,
				userRepository,
				userName,
				userEmail,
				userPassword,
			)

			const refreshTokenValue = parseCookieStringToObj(refreshTokenStr).cookieValue

			const avatarFilePath = path.join(__dirname, 'utils/files/avatar.png')

			const addAvatarRes = await postRequest(mainApp, RouteNames.USERS.ME.AVATAR.full)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.set('Content-Type', 'multipart/form-data')
				.attach('avatarFile', avatarFilePath)
				.set('authorization', 'Bearer ' + accessToken)
				.expect(HTTP_STATUSES.OK_200)

			expect(typeof addAvatarRes.body.data.avatarUrl).toBe('string')
		})
	})

	describe('Get current user avatar file', () => {
		it('should return 401 if there is not cookies', async () => {
			await userUtils.deviceTokenChecks.tokenNotExist(
				mainApp,
				'get',
				RouteNames.USERS.ME.AVATAR.full,
			)
		})

		it('should return 401 if the JWT refreshToken inside cookie is missing, expired or incorrect', async () => {
			await userUtils.deviceTokenChecks.tokenExpired(
				mainApp,
				'get',
				RouteNames.USERS.ME.AVATAR.full,
				userRepository,
				securityRepository,
				jwtService,
				mainConfig,
			)
		})

		it('should return 200 if the JWT refreshToken inside cookie is valid', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin(
				mainApp,
				userRepository,
				userName,
				userEmail,
				userPassword,
			)

			const refreshTokenValue = parseCookieStringToObj(refreshTokenStr).cookieValue

			const avatarFilePath = path.join(__dirname, 'utils/files/avatar.png')

			const addAvatarRes = await postRequest(mainApp, RouteNames.USERS.ME.AVATAR.full)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.set('Content-Type', 'multipart/form-data')
				.attach('avatarFile', avatarFilePath)
				.set('authorization', 'Bearer ' + accessToken)
				.expect(HTTP_STATUSES.OK_200)

			const getAvatarRes = await getRequest(mainApp, RouteNames.USERS.ME.AVATAR.full)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.set('authorization', 'Bearer ' + accessToken)
				.expect(HTTP_STATUSES.OK_200)

			checkSuccessResponse(getAvatarRes.body, 200, {
				avatarUrl: 'https://sociable-people.storage.yandexcloud.net/users/1/avatar.png',
			})
		})
	})

	describe('Delete current user avatar file', () => {
		it('should return 401 if there is not cookies', async () => {
			await userUtils.deviceTokenChecks.tokenNotExist(
				mainApp,
				'delete',
				RouteNames.USERS.ME.AVATAR.full,
			)
		})

		it('should return 401 if the JWT refreshToken inside cookie is missing, expired or incorrect', async () => {
			await userUtils.deviceTokenChecks.tokenExpired(
				mainApp,
				'delete',
				RouteNames.USERS.ME.AVATAR.full,
				userRepository,
				securityRepository,
				jwtService,
				mainConfig,
			)
		})

		it('should return 200 if the JWT refreshToken inside cookie is valid', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin(
				mainApp,
				userRepository,
				userName,
				userEmail,
				userPassword,
			)

			const refreshTokenValue = parseCookieStringToObj(refreshTokenStr).cookieValue

			const avatarFilePath = path.join(__dirname, 'utils/files/avatar.png')

			// Add avatar
			const addAvatarRes = await postRequest(mainApp, RouteNames.USERS.ME.AVATAR.full)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.set('Content-Type', 'multipart/form-data')
				.attach('avatarFile', avatarFilePath)
				.set('authorization', 'Bearer ' + accessToken)
				.expect(HTTP_STATUSES.OK_200)

			// Delete avatar
			const deleteAvatarRes = await deleteRequest(mainApp, RouteNames.USERS.ME.AVATAR.full)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.set('authorization', 'Bearer ' + accessToken)
				.expect(HTTP_STATUSES.OK_200)

			checkSuccessResponse(deleteAvatarRes.body, 200, {
				avatarUrl: null,
			})

			// Check avatar is gone
			const getAvatarRes = await getRequest(mainApp, RouteNames.USERS.ME.AVATAR.full)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.set('authorization', 'Bearer ' + accessToken)
				.expect(HTTP_STATUSES.OK_200)

			checkSuccessResponse(getAvatarRes.body, 200, null)
		})
	})
})
