import { INestApplication } from '@nestjs/common'
import { add } from 'date-fns'
import { JwtAdapterService } from '@app/jwt-adapter'
import { MainConfigService } from '@app/config'
import {
	checkErrorResponse,
	checkSuccessResponse,
	createTestApp,
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

it.only('123', async () => {
	expect(2).toBe(2)
})

describe('Auth (e2e)', () => {
	let app: INestApplication = 3 as any
	let emailAdapter: EmailAdapterService
	let gitHubService: GitHubService
	let googleService: GoogleService
	let reCaptchaAdapter: ReCaptchaAdapterService

	let userRepository: UserRepository
	let securityRepository: DevicesRepository
	let jwtService: JwtAdapterService
	let mainConfig: MainConfigService

	beforeAll(async () => {
		const createAppRes = await createTestApp(
			emailAdapter,
			gitHubService,
			googleService,
			reCaptchaAdapter,
		)
		app = createAppRes.app

		emailAdapter = createAppRes.emailAdapter
		gitHubService = createAppRes.gitHubService
		googleService = createAppRes.googleService
		reCaptchaAdapter = createAppRes.reCaptchaAdapter

		userRepository = await app.resolve(UserRepository)
		securityRepository = await app.resolve(DevicesRepository)
		jwtService = await app.resolve(JwtAdapterService)
		mainConfig = await app.resolve(MainConfigService)
	})

	beforeEach(async () => {
		await clearAllDB(app)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	describe('Add avatar file to me', () => {
		it('should return 401 if there is not cookies', async () => {
			await userUtils.deviceTokenChecks.tokenNotExist(app, RouteNames.USERS.ME.AVATAR.full)
		})

		it('should return 401 if the JWT refreshToken inside cookie is missing, expired or incorrect', async () => {
			await userUtils.deviceTokenChecks.tokenExpired(
				app,
				RouteNames.USERS.ME.AVATAR.full,
				userRepository,
				securityRepository,
				jwtService,
				mainConfig,
			)
		})

		it('should return 200 if the JWT refreshToken inside cookie is valid', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin(
				app,
				userRepository,
				userName,
				userEmail,
				userPassword,
			)

			const refreshTokenValue = parseCookieStringToObj(refreshTokenStr).cookieValue

			await postRequest(app, RouteNames.USERS.ME.AVATAR.full)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.expect(HTTP_STATUSES.OK_200)
		})
	})
})
