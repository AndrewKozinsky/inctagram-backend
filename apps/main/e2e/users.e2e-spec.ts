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

it.only('123', async () => {
	expect(2).toBe(2)
})

describe('Users (e2e)', () => {
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

	afterAll(async () => {
		await clearAllDB(mainApp)
	})

	afterEach(async () => {
		jest.clearAllMocks()
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
				defUserName,
				defUserEmail,
				defUserPassword,
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
				defUserName,
				defUserEmail,
				defUserPassword,
			)

			const refreshTokenValue = parseCookieStringToObj(refreshTokenStr).cookieValue

			// Send file in invalid format
			const textFilePath = path.join(__dirname, 'utils/files/text.txt')

			const addAvatarRes1 = await postRequest(mainApp, RouteNames.USERS.ME.AVATAR.full)
				.set('authorization', 'Bearer ' + accessToken)
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
				defUserName,
				defUserEmail,
				defUserPassword,
			)

			const refreshTokenValue = parseCookieStringToObj(refreshTokenStr).cookieValue

			const avatarFilePath = path.join(__dirname, 'utils/files/avatar.png')

			const addAvatarRes = await postRequest(mainApp, RouteNames.USERS.ME.AVATAR.full)
				.set('authorization', 'Bearer ' + accessToken)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.set('Content-Type', 'multipart/form-data')
				.attach('avatarFile', avatarFilePath)
				.expect(HTTP_STATUSES.OK_200)
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
				defUserName,
				defUserEmail,
				defUserPassword,
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
				avatarUrl: 'https://sociable-people.storage.yandexcloud.net/null',
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
				defUserName,
				defUserEmail,
				defUserPassword,
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

			// Check avatar is gone
			const getAvatarRes = await getRequest(mainApp, RouteNames.USERS.ME.AVATAR.full)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.set('authorization', 'Bearer ' + accessToken)
				.expect(HTTP_STATUSES.OK_200)

			checkSuccessResponse(getAvatarRes.body, 200, null)
		})
	})

	describe('Update user profile', () => {
		it('should return 401 if there is not cookies', async () => {
			await userUtils.deviceTokenChecks.tokenNotExist(
				mainApp,
				'patch',
				RouteNames.USERS.ME.full,
			)
		})

		it('should return 401 if the JWT refreshToken inside cookie is missing, expired or incorrect', async () => {
			await userUtils.deviceTokenChecks.tokenExpired(
				mainApp,
				'patch',
				RouteNames.USERS.ME.full,
				userRepository,
				securityRepository,
				jwtService,
				mainConfig,
			)
		})

		it('should return 200 if all data is correct', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin(
				mainApp,
				userRepository,
				defUserName,
				defUserEmail,
				defUserPassword,
			)
			const refreshTokenValue = parseCookieStringToObj(refreshTokenStr).cookieValue

			// ============================

			// Update profile first time
			const updateProfileBody_1 = {
				userName: 'myNewUserName',
				firstName: 'myNewFirstName',
				lastName: 'myNewLastName',
				dateOfBirth: new Date().toISOString(),
				countryCode: 'ru',
				cityId: 200,
				aboutMe: 'my new text about me',
			}

			const updateProfileRes_1 = await patchRequest(mainApp, RouteNames.USERS.ME.full)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.set('authorization', 'Bearer ' + accessToken)
				.send(updateProfileBody_1)
				.expect(HTTP_STATUSES.OK_200)

			const updateProfile_1 = updateProfileRes_1.body
			checkSuccessResponse(updateProfile_1, 200)
			userUtils.checkUserOutModel(updateProfile_1.data)

			// Check if user properties was changed
			const getProfileRes_1 = await getRequest(mainApp, RouteNames.USERS.ME.full)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.set('authorization', 'Bearer ' + accessToken)
				.expect(HTTP_STATUSES.OK_200)

			const updatedUser_1 = getProfileRes_1.body.data
			expect(updatedUser_1.id).toBe(1)
			expect(updatedUser_1.email).toBe('mail@email.com')
			expect(updatedUser_1.userName).toBe('myNewUserName')
			expect(updatedUser_1.firstName).toBe('myNewFirstName')
			expect(updatedUser_1.lastName).toBe('myNewLastName')
			expect(typeof updatedUser_1.dateOfBirth).toBe('string')
			expect(updatedUser_1.countryCode).toBe('ru')
			expect(updatedUser_1.cityId).toBe(200)
			expect(updatedUser_1.aboutMe).toBe('my new text about me')

			// ============================

			// Update profile second time with null values
			const updateProfileBody_2 = {
				userName: 'my-new-userName',
				firstName: null,
				lastName: null,
				dateOfBirth: null,
				countryCode: null,
				cityId: null,
				aboutMe: null,
			}

			const updateProfileRes_2 = await patchRequest(mainApp, RouteNames.USERS.ME.full)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.set('authorization', 'Bearer ' + accessToken)
				.send(updateProfileBody_2)
				.expect(HTTP_STATUSES.OK_200)

			const updateProfile_2 = updateProfileRes_2.body
			checkSuccessResponse(updateProfile_2, 200)
			userUtils.checkUserOutModel(updateProfile_2.data)

			// Check if user properties was changed
			const getProfileRes_2 = await getRequest(mainApp, RouteNames.USERS.ME.full)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.set('authorization', 'Bearer ' + accessToken)
				.expect(HTTP_STATUSES.OK_200)

			const updatedUser_2 = getProfileRes_2.body.data
			expect(updatedUser_2.id).toBe(1)
			expect(updatedUser_2.email).toBe('mail@email.com')
			expect(updatedUser_2.userName).toBe('my-new-userName')
			expect(updatedUser_2.firstName).toBe(null)
			expect(updatedUser_2.lastName).toBe(null)
			expect(updatedUser_2.dateOfBirth).toBe(null)
			expect(updatedUser_2.countryCode).toBe(null)
			expect(updatedUser_2.cityId).toBe(null)
			expect(updatedUser_2.aboutMe).toBe(null)
		})
	})

	describe('Get user profile', () => {
		it('should return 401 if there is not cookies', async () => {
			await userUtils.deviceTokenChecks.tokenNotExist(
				mainApp,
				'get',
				RouteNames.USERS.ME.full,
			)
		})

		it('should return 401 if the JWT refreshToken inside cookie is missing, expired or incorrect', async () => {
			await userUtils.deviceTokenChecks.tokenExpired(
				mainApp,
				'get',
				RouteNames.USERS.ME.full,
				userRepository,
				securityRepository,
				jwtService,
				mainConfig,
			)
		})

		it('should return 200 if all data is correct', async () => {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin(
				mainApp,
				userRepository,
				defUserName,
				defUserEmail,
				defUserPassword,
			)
			const refreshTokenValue = parseCookieStringToObj(refreshTokenStr).cookieValue

			// Get user profile
			const getProfileRes_1 = await getRequest(mainApp, RouteNames.USERS.ME.full)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.set('authorization', 'Bearer ' + accessToken)
				.expect(HTTP_STATUSES.OK_200)

			const updatedUser_1 = getProfileRes_1.body.data
			expect(updatedUser_1.id).toBe(1)
			expect(updatedUser_1.email).toBe(defUserEmail)
			expect(updatedUser_1.userName).toBe(defUserName)
			expect(updatedUser_1.firstName).toBe(null)
			expect(updatedUser_1.lastName).toBe(null)
			expect(updatedUser_1.dateOfBirth).toBe(null)
			expect(updatedUser_1.countryCode).toBe(null)
			expect(updatedUser_1.cityId).toBe(null)
			expect(updatedUser_1.aboutMe).toBe(null)

			// Update user profile
			const updateProfileBody_1 = {
				userName: 'myNewUserName',
				firstName: 'myNewFirstName',
				lastName: 'myNewLastName',
				dateOfBirth: new Date().toISOString(),
				countryCode: 'ru',
				cityId: 200,
				aboutMe: 'my new text about me',
			}

			const updateProfileRes = await patchRequest(mainApp, RouteNames.USERS.ME.full)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.set('authorization', 'Bearer ' + accessToken)
				.send(updateProfileBody_1)
				.expect(HTTP_STATUSES.OK_200)

			// Get user properties again
			const getProfileRes_2 = await getRequest(mainApp, RouteNames.USERS.ME.full)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.set('authorization', 'Bearer ' + accessToken)
				.expect(HTTP_STATUSES.OK_200)

			const updatedUser_2 = getProfileRes_2.body.data
			expect(updatedUser_2.id).toBe(1)
			expect(updatedUser_2.email).toBe('mail@email.com')
			expect(updatedUser_2.userName).toBe('myNewUserName')
			expect(updatedUser_2.firstName).toBe('myNewFirstName')
			expect(updatedUser_2.lastName).toBe('myNewLastName')
			expect(typeof updatedUser_2.dateOfBirth).toBe('string')
			expect(updatedUser_2.countryCode).toBe('ru')
			expect(updatedUser_2.cityId).toBe(200)
			expect(updatedUser_2.aboutMe).toBe('my new text about me')
		})
	})
})
