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
	mockFilesServiceSendMethod,
	resetMockFilesServiceSendMethod,
} from './common'
import RouteNames from '../../src/routes/routesConfig/routeNames'
import { HTTP_STATUSES } from '../../src/utils/httpStatuses'
import { UserRepository } from '../../src/repositories/user.repository'
import { createUniqString, parseCookieStringToObj } from '@app/shared/utils/stringUtils'
import { DeviceTokenOutModel } from '../../src/models/auth/auth.output.model'
import { DevicesRepository } from '../../src/repositories/devices.repository'
import { JwtAdapterService } from '@app/jwt-adapter'
import { MainConfigService } from '@app/config'
import { ClientProxy } from '@nestjs/microservices'
import { FileMS_GetUserAvatarOutContract } from '@app/shared'

export const userUtils = {
	async createUserWithUnconfirmedEmail(props: {
		mainApp: INestApplication
		filesMicroservice: ClientProxy
		userRepository: UserRepository
		userName?: string
		email?: string
		password?: string
	}) {
		const fixedUserName = props.userName ?? defUserName
		const fixedEmail = props.email ?? defUserEmail
		const fixedPassword = props.password ?? defUserPassword

		// TODO
		mockFilesServiceSendMethod(props.filesMicroservice, '')

		const firstRegRes = await postRequest(props.mainApp, RouteNames.AUTH.REGISTRATION.full)
			.send({ userName: fixedUserName, email: fixedEmail, password: fixedPassword })
			.expect(HTTP_STATUSES.CREATED_201)

		const userId = firstRegRes.body.data.id
		const user = await props.userRepository.getUserById(userId)

		resetMockFilesServiceSendMethod(props.filesMicroservice)

		return user
	},

	async createUserWithConfirmedEmail(props: {
		mainApp: INestApplication
		filesMicroservice: ClientProxy
		userRepository: UserRepository
		userName?: string
		email?: string
		password?: string
	}) {
		const user = await this.createUserWithUnconfirmedEmail({
			mainApp: props.mainApp,
			filesMicroservice: props.filesMicroservice,
			userRepository: props.userRepository,
			userName: props.userName,
			email: props.email,
			password: props.password,
		})

		// TODO
		mockFilesServiceSendMethod(props.filesMicroservice, '')

		// Confirm email
		await getRequest(
			props.mainApp,
			RouteNames.AUTH.EMAIL_CONFIRMATION.full + '?code=' + user!.emailConfirmationCode,
		).expect(HTTP_STATUSES.OK_200)

		resetMockFilesServiceSendMethod(props.filesMicroservice)

		return user
	},
	async createUserAndLogin(props: {
		mainApp: INestApplication
		filesMicroservice: ClientProxy
		userRepository: UserRepository
		userName?: string
		email?: string
		password?: string
	}) {
		const user = await this.createUserWithConfirmedEmail({
			mainApp: props.mainApp,
			filesMicroservice: props.filesMicroservice,
			userRepository: props.userRepository,
			userName: props.userName,
			email: props.email,
			password: props.password,
		})

		return this.loginUser({
			mainApp: props.mainApp,
			filesMicroservice: props.filesMicroservice,
			email: props.email,
			password: props.password,
		})
	},
	async loginUser(props: {
		mainApp: INestApplication
		filesMicroservice: ClientProxy
		email: string
		password: string
	}) {
		mockFilesServiceSendMethod(props.filesMicroservice, {
			avatarUrl: null,
		} as FileMS_GetUserAvatarOutContract)

		const loginRes = await postRequest(props.mainApp, RouteNames.AUTH.LOGIN.full)
			.send({ password: props.password, email: props.email })
			.expect(HTTP_STATUSES.OK_200)

		resetMockFilesServiceSendMethod(props.filesMicroservice)

		const { accessToken } = loginRes.body.data
		const refreshTokenStr = loginRes.headers['set-cookie'][0]

		return [accessToken, refreshTokenStr, loginRes.body.data.user]
	},
	convertCookieRefreshTokenToTokenStr(cookieRefreshToken: string) {
		const tokenParts = cookieRefreshToken.split(';')
		return tokenParts[0].split('=')[1]
	},
	checkUserOutModel(user: any) {
		expect(typeof user.id).toBe('number')
		expect(typeof user.email).toBe('string')
		expect(typeof user.userName).toBe('string')
		this.checkNullOrString(user.firstName)
		this.checkNullOrString(user.lastName)
		this.checkNullOrString(user.dateOfBirth)
		this.checkNullOrString(user.countryCode)
		this.checkNullOrNumber(user.cityId)
		this.checkNullOrString(user.aboutMe)
		this.checkNullOrString(user.avatar)

		expect(user.hashedPassword).toBeUndefined()
		expect(user.emailConfirmationCode).toBeUndefined()
		expect(user.confirmationCodeExpirationDate).toBeUndefined()
		expect(user.isEmailConfirmed).toBeUndefined()
		expect(user.passwordRecoveryCode).toBeUndefined()
		expect(user.githubId).toBeUndefined()
		expect(user.googleId).toBeUndefined()
	},
	checkDeviceOutModel(device: any) {
		expect(typeof device.ip).toBe('string')
		expect(typeof device.title).toBe('string')
		expect(typeof device.lastActiveDate).toBe('string')
		expect(typeof device.deviceId).toBe('string')
	},
	deviceTokenChecks: {
		// should return 401 if there is not cookies
		async tokenNotExist(
			app: INestApplication,
			methodType: 'get' | 'post' | 'put' | 'patch' | 'delete',
			routeUrl: string,
		) {
			let reqRes: any = null

			if (methodType === 'get') {
				reqRes = await getRequest(app, routeUrl).expect(HTTP_STATUSES.UNAUTHORIZED_401)
			} else if (methodType === 'post') {
				reqRes = await postRequest(app, routeUrl).expect(HTTP_STATUSES.UNAUTHORIZED_401)
			} else if (methodType === 'put') {
				reqRes = await putRequest(app, routeUrl).expect(HTTP_STATUSES.UNAUTHORIZED_401)
			} else if (methodType === 'patch') {
				reqRes = await patchRequest(app, routeUrl).expect(HTTP_STATUSES.UNAUTHORIZED_401)
			} else if (methodType === 'delete') {
				reqRes = await deleteRequest(app, routeUrl).expect(HTTP_STATUSES.UNAUTHORIZED_401)
			}

			const req = reqRes.body

			checkErrorResponse(req, 401, 'Refresh token is not valid')
		},
		// should return 401 if the JWT refreshToken inside cookie is missing, expired or incorrect
		async refreshTokenExpired(props: {
			mainApp: INestApplication
			filesMicroservice: ClientProxy
			methodType: 'get' | 'post' | 'put' | 'patch' | 'delete'
			routeUrl: string
			userRepository: UserRepository
			securityRepository: DevicesRepository
			jwtService: JwtAdapterService
			mainConfig: MainConfigService
		}) {
			const user = await userUtils.createUserWithUnconfirmedEmail({
				mainApp: props.mainApp,
				userRepository: props.userRepository,
				filesMicroservice: props.filesMicroservice,
			})
			// Create expired token
			const deviceId = createUniqString()

			const expiredRefreshToken: DeviceTokenOutModel = {
				issuedAt: new Date().toISOString(),
				expirationDate: new Date().toISOString(),
				deviceIP: '123',
				deviceId,
				deviceName: 'Unknown',
				userId: user!.id,
			}

			await props.securityRepository.insertDeviceRefreshToken(expiredRefreshToken)

			// Get created expired token
			const refreshToken =
				await props.securityRepository.getDeviceRefreshTokenByDeviceId(deviceId)
			const refreshTokenStr = props.jwtService.createRefreshTokenStr(refreshToken!.deviceId)

			if (props.methodType === 'get') {
				await getRequest(props.mainApp, props.routeUrl)
					.set('Cookie', props.mainConfig.get().refreshToken.name + '=' + refreshTokenStr)
					.expect(HTTP_STATUSES.UNAUTHORIZED_401)
			} else if (props.methodType === 'post') {
				await postRequest(props.mainApp, props.routeUrl)
					.set('Cookie', props.mainConfig.get().refreshToken.name + '=' + refreshTokenStr)
					.expect(HTTP_STATUSES.UNAUTHORIZED_401)
			} else if (props.methodType === 'put') {
				await putRequest(props.mainApp, props.routeUrl)
					.set('Cookie', props.mainConfig.get().refreshToken.name + '=' + refreshTokenStr)
					.expect(HTTP_STATUSES.UNAUTHORIZED_401)
			} else if (props.methodType === 'patch') {
				await patchRequest(props.mainApp, props.routeUrl)
					.set('Cookie', props.mainConfig.get().refreshToken.name + '=' + refreshTokenStr)
					.expect(HTTP_STATUSES.UNAUTHORIZED_401)
			} else if (props.methodType === 'delete') {
				await deleteRequest(props.mainApp, props.routeUrl)
					.set('Cookie', props.mainConfig.get().refreshToken.name + '=' + refreshTokenStr)
					.expect(HTTP_STATUSES.UNAUTHORIZED_401)
			}
		},
		async tokenValid(props: {
			mainApp: INestApplication
			filesMicroservice: ClientProxy
			routeUrl: string
			userRepository: UserRepository
			mainConfig: MainConfigService
		}) {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin({
				mainApp: props.mainApp,
				filesMicroservice: props.filesMicroservice,
				userRepository: props.userRepository,
				userName: defUserName,
				email: defUserEmail,
				password: defUserPassword,
			})

			const refreshTokenValue = parseCookieStringToObj(refreshTokenStr).cookieValue

			await postRequest(props.mainApp, props.routeUrl)
				.set('Cookie', props.mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.expect(HTTP_STATUSES.OK_200)
		},
	},
	checkNullOrString(data: any) {
		expect(data === null || typeof data === 'string').toBe(true)
	},
	checkNullOrNumber(data: any) {
		expect(data === null || typeof data === 'number').toBe(true)
	},
}
