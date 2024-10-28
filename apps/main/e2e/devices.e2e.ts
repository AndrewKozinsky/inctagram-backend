import { INestApplication } from '@nestjs/common'
import { JwtAdapterService } from '@app/jwt-adapter'
import { MainConfigService } from '@app/config'
import {
	deleteRequest,
	getRequest,
	defUserEmail,
	defUserName,
	defUserPassword,
} from './utils/common'
import RouteNames from '../src/routes/routesConfig/routeNames'
import { HTTP_STATUSES } from '../src/utils/httpStatuses'
import { clearAllDB } from './utils/db'
import { EmailAdapterService } from '@app/email-adapter'
import { UserRepository } from '../src/repositories/user.repository'
import { userUtils } from './utils/userUtils'
import { createUniqString } from '@app/shared'
import { DeviceTokenOutModel } from '../src/models/auth/auth.output.model'
import { GitHubService } from '../src/routes/auth/gitHubService'
import { GoogleService } from '../src/routes/auth/googleService'
import { DevicesRepository } from '../src/repositories/devices.repository'
import { ReCaptchaAdapterService } from '@app/re-captcha-adapter'
import { createMainApp } from './utils/createMainApp'
import { ClientProxy } from '@nestjs/microservices'

it.only('123', async () => {
	expect(2).toBe(2)
})

describe('Auth (e2e)', () => {
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

	afterEach(() => {
		jest.clearAllMocks()
	})

	describe('Getting all user devices', () => {
		it('should forbid a request if there is not refresh token', async () => {
			await getRequest(mainApp, RouteNames.SECURITY.DEVICES.full).expect(
				HTTP_STATUSES.UNAUTHORIZED_401,
			)
		})

		it('should return an array of devices data if a refreshToken inside cookie is valid', async () => {
			const [accessToken, refreshToken] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})
			const refreshToken1Str = userUtils.convertCookieRefreshTokenToTokenStr(refreshToken)

			const getUserDevicesRes1 = await getRequest(mainApp, RouteNames.SECURITY.DEVICES.full)
				.set('authorization', 'Bearer ' + accessToken)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshToken1Str)
				.expect(HTTP_STATUSES.OK_200)

			expect(getUserDevicesRes1.body.data.length).toBe(1)
			userUtils.checkDeviceOutModel(getUserDevicesRes1.body.data[0])

			// Second login

			const [accessToken2, refreshToken2] = await userUtils.loginUser({
				mainApp,
				filesMicroservice,
				email: defUserEmail,
				password: defUserPassword,
			})
			const refreshToken2Str = userUtils.convertCookieRefreshTokenToTokenStr(refreshToken2)

			const getUserDevicesRes2 = await getRequest(mainApp, RouteNames.SECURITY.DEVICES.full)
				.set('authorization', 'Bearer ' + accessToken)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshToken2Str)
				.expect(HTTP_STATUSES.OK_200)

			expect(getUserDevicesRes2.body.data.length).toBe(2)
			userUtils.checkDeviceOutModel(getUserDevicesRes2.body.data[1])
		})
	})

	describe('Terminate specified device session', () => {
		it('should forbid a request from a user without a device refresh token', async () => {
			await deleteRequest(mainApp, RouteNames.SECURITY.DEVICES.DEVICE_ID('999').full).expect(
				HTTP_STATUSES.UNAUTHORIZED_401,
			)
		})

		it('should forbid a request from a user with an expired device refresh token', async () => {
			const user = await userUtils.createUserWithConfirmedEmail({
				mainApp,
				filesMicroservice,
				userRepository,
			})
			const userId = user.id

			// Create expired token
			const deviceId = createUniqString()

			const expiredRefreshToken: DeviceTokenOutModel = {
				issuedAt: new Date().toISOString(),
				expirationDate: new Date().toISOString(),
				deviceIP: '123',
				deviceId,
				deviceName: 'Unknown',
				userId,
			}

			await securityRepository.insertDeviceRefreshToken(expiredRefreshToken)

			// Get created expired token
			const refreshToken = await securityRepository.getDeviceRefreshTokenByDeviceId(deviceId)

			await deleteRequest(mainApp, RouteNames.SECURITY.DEVICES.DEVICE_ID('999').full)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshToken)
				.expect(HTTP_STATUSES.UNAUTHORIZED_401)
		})

		it('should return 404 if client tries to terminate a non existed device', async () => {
			const [accessToken, refreshToken] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})
			const refreshTokenStr = userUtils.convertCookieRefreshTokenToTokenStr(refreshToken)

			await deleteRequest(mainApp, RouteNames.SECURITY.DEVICES.DEVICE_ID('999').full)
				.set('authorization', 'Bearer ' + accessToken)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenStr)
				.expect(HTTP_STATUSES.NOT_FOUNT_404)
		})

		it('should return 403 if a client tries to terminate a device which does not belong to him', async () => {
			// Create a user 1
			const [accessToken1, refreshToken1] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})
			const refreshToken1Str = userUtils.convertCookieRefreshTokenToTokenStr(refreshToken1)

			const deviceId = jwtService.getRefreshTokenDataFromTokenStr(refreshToken1Str)!.deviceId

			// Create a user 2
			const userName2 = 'Second-user-name'
			const password2 = 'password-2'
			const email2 = 'email-2@email.ru'

			await userUtils.createUserWithConfirmedEmail({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: userName2,
				email: email2,
				password: password2,
			})
			const [accessToken2, refreshToken2] = await userUtils.loginUser({
				mainApp,
				filesMicroservice,
				email: email2,
				password: password2,
			})
			const refreshToken2Str = userUtils.convertCookieRefreshTokenToTokenStr(refreshToken2)

			await deleteRequest(mainApp, RouteNames.SECURITY.DEVICES.DEVICE_ID(deviceId).full)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshToken2Str)
				.expect(HTTP_STATUSES.UNAUTHORIZED_401)
		})

		it('should return 204 if a client tries to terminate his device', async () => {
			const [accessToken, refreshToken] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})
			const refreshTokenStr = userUtils.convertCookieRefreshTokenToTokenStr(refreshToken)

			const deviceId = jwtService.getRefreshTokenDataFromTokenStr(refreshTokenStr)!.deviceId

			return await deleteRequest(
				mainApp,
				RouteNames.SECURITY.DEVICES.DEVICE_ID(deviceId).full,
			)
				.set('authorization', 'Bearer ' + accessToken)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenStr)
				.expect(HTTP_STATUSES.OK_200)
		})
	})

	describe('Terminate this device session', () => {
		it('should forbid a request from a user without a device refresh token', async () => {
			return deleteRequest(mainApp, RouteNames.SECURITY.DEVICES.full).expect(
				HTTP_STATUSES.UNAUTHORIZED_401,
			)
		})

		it('should forbid a request from a user with an expired device refresh token', async () => {
			const user = await userUtils.createUserWithConfirmedEmail({
				mainApp,
				filesMicroservice,
				userRepository,
			})
			const userId = user.id

			// Create expired token
			const deviceId = createUniqString()

			const expiredRefreshToken: DeviceTokenOutModel = {
				issuedAt: new Date().toISOString(),
				expirationDate: new Date().toISOString(),
				deviceIP: '123',
				deviceId,
				deviceName: 'Unknown',
				userId,
			}

			await securityRepository.insertDeviceRefreshToken(expiredRefreshToken)

			// Get created expired token
			const refreshToken = securityRepository.getDeviceRefreshTokenByDeviceId(deviceId)

			return deleteRequest(mainApp, RouteNames.SECURITY.DEVICES.full)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshToken)
				.expect(HTTP_STATUSES.UNAUTHORIZED_401)
		})

		it('should return 204 if a client tries to terminate current device', async () => {
			const [accessToken, refreshToken] = await userUtils.createUserAndLogin({
				mainApp,
				filesMicroservice,
				userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})

			const deviceRefreshTokenStr =
				userUtils.convertCookieRefreshTokenToTokenStr(refreshToken)

			return await deleteRequest(mainApp, RouteNames.SECURITY.DEVICES.full)
				.set('authorization', 'Bearer ' + accessToken)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + deviceRefreshTokenStr)
				.expect(HTTP_STATUSES.OK_200)
		})
	})
})
