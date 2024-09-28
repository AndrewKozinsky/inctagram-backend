import { INestApplication, INestMicroservice } from '@nestjs/common'
import { add } from 'date-fns'
import { JwtAdapterService } from '@app/jwt-adapter'
import { MainConfigService } from '@app/config'
import {
	checkErrorResponse,
	checkSuccessResponse,
	getFieldInErrorObject,
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
import { createUniqString, parseCookieStringToObj } from '../src/utils/stringUtils'
import { DeviceTokenOutModel } from '../src/models/auth/auth.output.model'
import { GitHubService } from '../src/routes/auth/gitHubService'
import { GoogleService } from '../src/routes/auth/googleService'
import { DevicesRepository } from '../src/repositories/devices.repository'
import { ReCaptchaAdapterService } from '@app/re-captcha-adapter'
import path from 'node:path'
import { createFilesApp, createMainApp } from './utils/createMainApp'

it('123', async () => {
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

	describe('Add avatar file to me', () => {
		it('should return 401 if there is not cookies', async () => {
			await userUtils.deviceTokenChecks.tokenNotExist(
				mainApp,
				RouteNames.USERS.ME.AVATAR.full,
			)
		})

		it('should return 401 if the JWT refreshToken inside cookie is missing, expired or incorrect', async () => {
			await userUtils.deviceTokenChecks.tokenExpired(
				mainApp,
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
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.set('Content-Type', 'multipart/form-data')

				.attach('avatarFile', bigFilePath)
				.expect(HTTP_STATUSES.BAD_REQUEST_400)

			checkErrorResponse(addAvatarRes2.body, 400, 'File is too large')
		})

		it.only('should return 200 if send correct avatar image', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin(
				mainApp,
				userRepository,
				userName,
				userEmail,
				userPassword,
			)

			/*const refreshTokenValue = parseCookieStringToObj(refreshTokenStr).cookieValue

			const avatarFilePath = path.join(__dirname, 'utils/files/avatar.png')

			const addAvatarRes = await postRequest(mainApp, RouteNames.USERS.ME.AVATAR.full)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.set('Content-Type', 'multipart/form-data')
				.attach('avatarFile', avatarFilePath)
				.expect(HTTP_STATUSES.OK_200)*/
		})

		// DELETE
		/*it.only('should return 200 if send correct avatar image', async () => {
			await getRequest(mainApp, RouteNames.USERS.value).expect(HTTP_STATUSES.OK_200)
		})*/
	})
})
