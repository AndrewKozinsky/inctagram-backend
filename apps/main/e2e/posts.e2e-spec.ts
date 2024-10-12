import { INestApplication } from '@nestjs/common'
import { JwtAdapterService } from '@app/jwt-adapter'
import { MainConfigService } from '@app/config'
import path from 'node:path'
import {
	checkErrorResponse,
	checkSuccessResponse,
	deleteRequest,
	getRequest,
	postRequest,
	defUserEmail,
	defUserName,
	defUserPassword,
	patchRequest,
} from './utils/common'
import RouteNames from '../src/routes/routesConfig/routeNames'
import { HTTP_STATUSES } from '../src/utils/httpStatuses'
import { clearAllDB } from './utils/db'
import { EmailAdapterService } from '@app/email-adapter'
import { UserRepository } from '../src/repositories/user.repository'
import { userUtils } from './utils/userUtils'
import { parseCookieStringToObj } from '@app/shared'
import { GitHubService } from '../src/routes/auth/gitHubService'
import { GoogleService } from '../src/routes/auth/googleService'
import { DevicesRepository } from '../src/repositories/devices.repository'
import { ReCaptchaAdapterService } from '@app/re-captcha-adapter'
import { createMainApp } from './utils/createMainApp'
import { agent as request } from 'supertest'
import { ClientProxy } from '@nestjs/microservices'

it('123', async () => {
	expect(2).toBe(2)
})

describe('Posts (e2e)', () => {
	let mainApp: INestApplication

	let emailAdapter: EmailAdapterService
	let gitHubService: GitHubService
	let googleService: GoogleService
	let reCaptchaAdapter: ReCaptchaAdapterService
	let filesMicroservice: ClientProxy

	let userRepository: UserRepository
	let securityRepository: DevicesRepository
	let jwtService: JwtAdapterService
	let mainConfig: MainConfigService

	beforeAll(async () => {
		const createMainAppRes = await createMainApp(
			emailAdapter,
			gitHubService,
			googleService,
			reCaptchaAdapter,
			filesMicroservice,
		)

		mainApp = createMainAppRes.mainApp

		emailAdapter = createMainAppRes.emailAdapter
		gitHubService = createMainAppRes.gitHubService
		googleService = createMainAppRes.googleService
		reCaptchaAdapter = createMainAppRes.reCaptchaAdapter
		filesMicroservice = createMainAppRes.filesMicroservice

		userRepository = await mainApp.resolve(UserRepository)
		securityRepository = await mainApp.resolve(DevicesRepository)
		jwtService = await mainApp.resolve(JwtAdapterService)
		mainConfig = await mainApp.resolve(MainConfigService)
	})

	beforeEach(async () => {
		await clearAllDB(mainApp)
	})

	afterAll(async () => {
		await clearAllDB(mainApp)
	})

	afterEach(async () => {
		jest.clearAllMocks()
	})

	describe('Add a new post', () => {
		it('should return 401 if there is not cookies', async () => {
			await userUtils.deviceTokenChecks.tokenNotExist(mainApp, 'post', RouteNames.POSTS.value)
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

		it('should return 400 if the JWT refreshToken inside cookie is valid, but request body is not send', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin(
				mainApp,
				userRepository,
				defUserName,
				defUserEmail,
				defUserPassword,
			)

			const refreshTokenValue = parseCookieStringToObj(refreshTokenStr).cookieValue

			const addPostRes = await postRequest(mainApp, RouteNames.POSTS.value)
				.set('authorization', 'Bearer ' + accessToken)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.expect(HTTP_STATUSES.BAD_REQUEST_400)
			console.log(addPostRes.body)

			checkErrorResponse(addPostRes.body, 400, 'Files not found')
		})

		it('should return 400 if the JWT refreshToken inside cookie is valid, but send wrong files', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin(
				mainApp,
				userRepository,
				defUserName,
				defUserEmail,
				defUserPassword,
			)

			const refreshTokenValue = parseCookieStringToObj(refreshTokenStr).cookieValue

			// Send large file and in invalid format
			const textFilePath = path.join(__dirname, 'utils/files/text.txt')
			const bigFilePath = path.join(__dirname, 'utils/files/big-avatar.png')

			const addPostRes = await postRequest(mainApp, RouteNames.POSTS.value)
				.set('authorization', 'Bearer ' + accessToken)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.set('Content-Type', 'multipart/form-data')
				.attach('photoFiles', textFilePath)
				.attach('photoFiles', bigFilePath)
				.expect(HTTP_STATUSES.BAD_REQUEST_400)

			checkErrorResponse(addPostRes.body, 400, 'One of files is too large')
		})

		it.only('should return 200 if send correct data', async () => {
			const [accessToken, refreshTokenStr, user] = await userUtils.createUserAndLogin(
				mainApp,
				userRepository,
				defUserName,
				defUserEmail,
				defUserPassword,
			)

			const refreshTokenValue = parseCookieStringToObj(refreshTokenStr).cookieValue

			const avatarFilePath = path.join(__dirname, 'utils/files/avatar.png')

			// I write a test to check a route where images and body are sent.
			// But there are some problems.
			const addPostRes = await postRequest(mainApp, RouteNames.POSTS.value)
				.set('authorization', 'Bearer ' + accessToken)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.set('Content-Type', 'multipart/form-data')
				.attach('avatarFile', avatarFilePath)
				.attach('avatarFile', avatarFilePath)
				// If I use the code below to send data in body
				/*.send({
					text: 'Post description',
					location: 'Photo location',
				})*/
				// the test throw an error
				// .send() can't be used if .attach() or .field() is used.
				// Please use only .send() or only .field() & .attach()
				// But when I use field instead of send
				.field('text', 'Post description')
				.field('location', 'Photo location')
			// My controller return this error
			/* {
			  status: 'error',
			  code: 400,
			  message: 'Wrong body',
			  wrongFields: 'Unexpected field'
			} */
			// And I don't understand which field is wrong

			console.log(addPostRes.body)
		})
	})
})
