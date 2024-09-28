import { INestApplication } from '@nestjs/common'
import {
	checkErrorResponse,
	deleteRequest,
	getRequest,
	postRequest,
	putRequest,
	userEmail,
	userName,
	userPassword,
} from './common'
import RouteNames from '../../src/routes/routesConfig/routeNames'
import { HTTP_STATUSES } from '../../src/utils/httpStatuses'
import { UserRepository } from '../../src/repositories/user.repository'
import { createUniqString, parseCookieStringToObj } from '../../src/utils/stringUtils'
import { DeviceTokenOutModel } from '../../src/models/auth/auth.output.model'
import { DevicesRepository } from '../../src/repositories/devices.repository'
import { JwtAdapterService } from '@app/jwt-adapter'
import { MainConfigService } from '@app/config'

export const userUtils = {
	async createUserWithUnconfirmedEmail(
		app: INestApplication,
		userRepository: UserRepository,
		name?: string,
		email?: string,
		password?: string,
	) {
		const fixedUserName = name ?? userName
		const fixedEmail = email ?? userEmail
		const fixedPassword = password ?? userPassword

		const firstRegRes = await postRequest(app, RouteNames.AUTH.REGISTRATION.full)
			.send({ name: fixedUserName, email: fixedEmail, password: fixedPassword })
			.expect(HTTP_STATUSES.CREATED_201)

		const userId = firstRegRes.body.data.id
		return await userRepository.getUserById(userId)
	},

	async createUserWithConfirmedEmail(
		app: INestApplication,
		userRepository: UserRepository,
		userName?: string,
		email?: string,
		password?: string,
	) {
		const user = await this.createUserWithUnconfirmedEmail(
			app,
			userRepository,
			userName,
			email,
			password,
		)

		// Confirm email
		await getRequest(
			app,
			RouteNames.AUTH.EMAIL_CONFIRMATION.full + '?code=' + user!.emailConfirmationCode,
		).expect(HTTP_STATUSES.OK_200)

		return user
	},
	async createUserAndLogin(
		app: INestApplication,
		userRepository: UserRepository,
		userName?: string,
		email?: string,
		password?: string,
	) {
		const user = await this.createUserWithConfirmedEmail(
			app,
			userRepository,
			userName,
			email,
			password,
		)

		return this.loginUser(app, email, password)
	},
	async loginUser(app: INestApplication, email: string, password: string) {
		const loginRes = await postRequest(app, RouteNames.AUTH.LOGIN.full)
			.send({ password, email })
			.expect(HTTP_STATUSES.OK_200)

		const { accessToken } = loginRes.body.data
		const refreshTokenStr = loginRes.headers['set-cookie'][0]

		return [accessToken, refreshTokenStr]
	},
	convertCookieRefreshTokenToTokenStr(cookieRefreshToken: string) {
		const tokenParts = cookieRefreshToken.split(';')
		return tokenParts[0].split('=')[1]
	},
	checkUserOutModel(user: any) {
		expect(typeof user.id).toBe('number')
		expect(typeof user.email).toBe('string')
		expect(typeof user.name).toBe('string')

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
			methodType: 'get' | 'post' | 'put' | 'delete',
			routeUrl: string,
		) {
			let reqRes: any = null

			if (methodType === 'get') {
				reqRes = await getRequest(app, routeUrl).expect(HTTP_STATUSES.UNAUTHORIZED_401)
			} else if (methodType === 'post') {
				reqRes = await postRequest(app, routeUrl).expect(HTTP_STATUSES.UNAUTHORIZED_401)
			} else if (methodType === 'put') {
				reqRes = await putRequest(app, routeUrl).expect(HTTP_STATUSES.UNAUTHORIZED_401)
			} else if (methodType === 'delete') {
				reqRes = await deleteRequest(app, routeUrl).expect(HTTP_STATUSES.UNAUTHORIZED_401)
			}

			const req = reqRes.body

			checkErrorResponse(req, 401, 'Refresh token is not valid')
		},
		// should return 401 if the JWT refreshToken inside cookie is missing, expired or incorrect
		async tokenExpired(
			app: INestApplication,
			methodType: 'get' | 'post' | 'put' | 'delete',
			routeUrl: string,
			userRepository: UserRepository,
			securityRepository: DevicesRepository,
			jwtService: JwtAdapterService,
			mainConfig: MainConfigService,
		) {
			const user = await userUtils.createUserWithUnconfirmedEmail(app, userRepository)
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

			await securityRepository.insertDeviceRefreshToken(expiredRefreshToken)

			// Get created expired token
			const refreshToken = await securityRepository.getDeviceRefreshTokenByDeviceId(deviceId)
			const refreshTokenStr = jwtService.createRefreshTokenStr(
				refreshToken!.deviceId,
				refreshToken!.expirationDate,
			)

			if (methodType === 'get') {
				await getRequest(app, routeUrl)
					.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenStr)
					.expect(HTTP_STATUSES.UNAUTHORIZED_401)
			} else if (methodType === 'post') {
				await postRequest(app, routeUrl)
					.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenStr)
					.expect(HTTP_STATUSES.UNAUTHORIZED_401)
			} else if (methodType === 'put') {
				await putRequest(app, routeUrl)
					.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenStr)
					.expect(HTTP_STATUSES.UNAUTHORIZED_401)
			} else if (methodType === 'delete') {
				await deleteRequest(app, routeUrl)
					.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenStr)
					.expect(HTTP_STATUSES.UNAUTHORIZED_401)
			}
		},
		async tokenValid(
			app: INestApplication,
			routeUrl: string,
			userRepository: UserRepository,
			mainConfig: MainConfigService,
		) {
			const [accessToken, refreshTokenStr] = await userUtils.createUserAndLogin(
				app,
				userRepository,
				userName,
				userEmail,
				userPassword,
			)

			const refreshTokenValue = parseCookieStringToObj(refreshTokenStr).cookieValue

			await postRequest(app, routeUrl)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.expect(HTTP_STATUSES.OK_200)
		},
	},
}
