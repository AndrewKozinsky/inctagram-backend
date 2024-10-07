import { INestApplication } from '@nestjs/common'
import { JwtAdapterService } from '@app/jwt-adapter'
import { MainConfigService } from '@app/config'
import {
	checkErrorResponse,
	checkSuccessResponse,
	getFieldInErrorObject,
	getRequest,
	postRequest,
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
import { GitHubService } from '../src/routes/auth/gitHubService'
import { GoogleService } from '../src/routes/auth/googleService'
import { DevicesRepository } from '../src/repositories/devices.repository'
import { ReCaptchaAdapterService } from '@app/re-captcha-adapter'
import { createMainApp } from './utils/createMainApp'
import { parseCookieStringToObj } from '../src/utils/stringUtils'

it.only('123', async () => {
	expect(2).toBe(2)
})

describe('Auth (e2e)', () => {
	let mainApp: INestApplication
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

	afterEach(() => {
		jest.clearAllMocks()
	})

	describe('Register user', () => {
		it('should return 400 if dto has incorrect values', async () => {
			await postRequest(mainApp, RouteNames.AUTH.REGISTRATION.full).expect(
				HTTP_STATUSES.BAD_REQUEST_400,
			)

			const registrationRes = await postRequest(mainApp, RouteNames.AUTH.REGISTRATION.full)
				.send({ userName: '', password: '', email: 'wrong-email.com' })
				.expect(HTTP_STATUSES.BAD_REQUEST_400)

			const reg = registrationRes.body

			expect(reg.status).toBe('error')
			expect(reg.code).toBe(HTTP_STATUSES.BAD_REQUEST_400)

			expect({}.toString.call(reg.wrongFields)).toBe('[object Array]')
			expect(reg.wrongFields.length).toBe(3)

			const [nameFieldErrText, passwordFieldErrText, emailFieldErrText] =
				getFieldInErrorObject(reg, ['userName', 'password', 'email'])

			expect(nameFieldErrText).toBe('Minimum number of characters 6')
			expect(passwordFieldErrText).toBe('Minimum number of characters 6')
			expect(emailFieldErrText).toBe('The email must match the format example@example.com')
		})

		it('should return 201 if tries to register an user with existed, but unconfirmed email', async () => {
			await postRequest(mainApp, RouteNames.AUTH.REGISTRATION.full)
				.send({ userName: defUserName, password: defUserPassword, email: defUserEmail })
				.expect(HTTP_STATUSES.CREATED_201)

			await postRequest(mainApp, RouteNames.AUTH.REGISTRATION.full)
				.send({
					userName: defUserName,
					password: defUserPassword,
					email: defUserEmail,
				})
				.expect(HTTP_STATUSES.CREATED_201)
		})

		it('should return an error if the entered email is already registered and confirmed', async () => {
			const user = await userUtils.createUserWithConfirmedEmail(mainApp, userRepository)
			expect(emailAdapter.sendEmailConfirmationMessage).toBeCalledTimes(1)

			const secondRegRes = await postRequest(mainApp, RouteNames.AUTH.REGISTRATION.full)
				.send({ userName: defUserName, password: defUserPassword, email: defUserEmail })
				.expect(HTTP_STATUSES.BAD_REQUEST_400)

			const secondReg = secondRegRes.body
			checkErrorResponse(secondReg, 400, 'Email or username is already registered')
			expect(emailAdapter.sendEmailConfirmationMessage).toBeCalledTimes(1)
		})

		it('should return 201 if dto has correct values', async () => {
			const registrationRes = await postRequest(mainApp, RouteNames.AUTH.REGISTRATION.full)
				.send({ userName: defUserName, password: defUserPassword, email: defUserEmail })
				.expect(HTTP_STATUSES.CREATED_201)

			expect(emailAdapter.sendEmailConfirmationMessage).toBeCalledTimes(1)
		})

		it('should return 400 if they try to register a user with a verified email', async () => {
			const registrationRes = await postRequest(mainApp, RouteNames.AUTH.REGISTRATION.full)
				.send({ userName: defUserName, password: defUserPassword, email: defUserEmail })
				.expect(HTTP_STATUSES.CREATED_201)

			// Make email verified
			await userRepository.makeEmailVerified(registrationRes.body.data.id)

			await postRequest(mainApp, RouteNames.AUTH.REGISTRATION.full)
				.send({
					userName: defUserName,
					password: defUserPassword,
					email: defUserEmail,
				})
				.expect(HTTP_STATUSES.BAD_REQUEST_400)
		})
	})

	describe('Confirm email', () => {
		it('should return 400 if dto has incorrect values', async () => {
			const confirmationRes = await getRequest(
				mainApp,
				RouteNames.AUTH.EMAIL_CONFIRMATION.full,
			).expect(HTTP_STATUSES.BAD_REQUEST_400)

			const confirmation = confirmationRes.body

			checkErrorResponse(confirmation, 400, 'Wrong body')

			expect({}.toString.call(confirmation.wrongFields)).toBe('[object Array]')
			expect(confirmation.wrongFields.length).toBe(1)

			const [codeFieldErrText] = getFieldInErrorObject(confirmation, ['code'])

			expect(codeFieldErrText).toBe('Code must be a string')
		})

		it('should return 400 if email verification allowed time is over', async () => {
			const user = await userUtils.createUserWithUnconfirmedEmail(mainApp, userRepository)

			// Try to confirm email with a wrong confirmation code
			const confirmEmailRes = await getRequest(
				mainApp,
				RouteNames.AUTH.EMAIL_CONFIRMATION.full + '?code=' + 'WRONG__$1Hn[595n8]T',
			).expect(HTTP_STATUSES.BAD_REQUEST_400)

			const confirmEmail = confirmEmailRes.body
			checkErrorResponse(confirmEmail, 400, 'Email confirmation code not found')
		})

		it('should return 400 if email verification allowed time is over', async () => {
			const user = await userUtils.createUserWithUnconfirmedEmail(mainApp, userRepository)

			// Change email confirmation allowed time to past
			await userRepository.updateUser(user!.id, {
				email_confirmation_code_expiration_date: new Date().toISOString(),
			})

			// Try to confirm email
			const confirmEmailRes = await getRequest(
				mainApp,
				RouteNames.AUTH.EMAIL_CONFIRMATION.full + '?code=' + user!.emailConfirmationCode,
			).expect(HTTP_STATUSES.BAD_REQUEST_400)

			const confirmEmail = confirmEmailRes.body
			checkErrorResponse(confirmEmail, 400, 'Email confirmation code is expired')
		})

		it('should return 200 if email successfully confirmed', async () => {
			const user = await userUtils.createUserWithUnconfirmedEmail(mainApp, userRepository)

			// Try to confirm email
			const confirmEmailRes = await getRequest(
				mainApp,
				RouteNames.AUTH.EMAIL_CONFIRMATION.full + '?code=' + user!.emailConfirmationCode,
			).expect(HTTP_STATUSES.OK_200)

			const confirmEmail = confirmEmailRes.body
			checkSuccessResponse(confirmEmail, 200, null)
		})

		it('should return 400 if they tries confirm email second time', async () => {
			const user = await userUtils.createUserWithConfirmedEmail(mainApp, userRepository)

			// Try to confirm email second time
			const confirmEmailSecondTimeRes = await getRequest(
				mainApp,
				RouteNames.AUTH.EMAIL_CONFIRMATION.full + '?code=' + user!.emailConfirmationCode,
			).expect(HTTP_STATUSES.BAD_REQUEST_400)

			const confirmEmailSecondTime = confirmEmailSecondTimeRes.body
			checkErrorResponse(confirmEmailSecondTime, 400, 'Email confirmation code not found')
		})
	})

	describe('Login', () => {
		it('should return 400 if dto has incorrect values', async () => {
			const loginRes = await postRequest(mainApp, RouteNames.AUTH.LOGIN.full).expect(
				HTTP_STATUSES.BAD_REQUEST_400,
			)

			const login = loginRes.body

			checkErrorResponse(login, 400, 'Wrong body')

			expect({}.toString.call(login.wrongFields)).toBe('[object Array]')
			expect(login.wrongFields.length).toBe(2)
			const [emailFieldErrText, passwordFieldErrText] = getFieldInErrorObject(login, [
				'email',
				'password',
			])

			expect(emailFieldErrText).toBe('Email must be a string')
			expect(passwordFieldErrText).toBe('Password must be a string')
		})

		it('should return 400 if email and password does not match', async () => {
			const user = await userUtils.createUserWithConfirmedEmail(mainApp, userRepository)

			const loginRes = await postRequest(mainApp, RouteNames.AUTH.LOGIN.full)
				.send({ password: 'mywrongpassword', email: defUserEmail })
				.expect(HTTP_STATUSES.BAD_REQUEST_400)

			const login = loginRes.body

			checkErrorResponse(login, 400, 'Email or passwords do not match')
		})

		it('should return 403 if email is not confirmed', async () => {
			const user = await userUtils.createUserWithUnconfirmedEmail(mainApp, userRepository)

			const loginRes = await postRequest(mainApp, RouteNames.AUTH.LOGIN.full)
				.send({ password: defUserPassword, email: defUserEmail })
				.expect(HTTP_STATUSES.FORBIDDEN_403)

			const login = loginRes.body
			checkErrorResponse(login, 403, 'Email is not confirmed')
		})

		it('should return 200 if dto has correct values and email is confirmed', async () => {
			const user = await userUtils.createUserWithConfirmedEmail(mainApp, userRepository)

			const loginRes = await postRequest(mainApp, RouteNames.AUTH.LOGIN.full)
				.send({ password: defUserPassword, email: defUserEmail })
				.expect(HTTP_STATUSES.OK_200)

			const login = loginRes.body
			checkSuccessResponse(login, 200)

			expect(typeof login.data.accessToken).toBe('string')
			userUtils.checkUserOutModel(login.data.user)
		})
	})

	describe('Confirmation email resending', () => {
		it('should return 400 if dto has incorrect values', async () => {
			const resendConfirmEmailRes = await postRequest(
				mainApp,
				RouteNames.AUTH.CONFIRM_EMAIL_RESENDING.full,
			).expect(HTTP_STATUSES.BAD_REQUEST_400)

			const resend = resendConfirmEmailRes.body

			expect(resend.status).toBe('error')
			expect(resend.code).toBe(HTTP_STATUSES.BAD_REQUEST_400)

			expect({}.toString.call(resend.wrongFields)).toBe('[object Array]')
			expect(resend.wrongFields.length).toBe(1)

			const [emailFieldErrText] = getFieldInErrorObject(resend, ['email'])

			expect(emailFieldErrText).toBe('Email must be a string')
		})

		it('should return an error if the entered email is not exists', async () => {
			const resendConfirmEmailRes = await postRequest(
				mainApp,
				RouteNames.AUTH.CONFIRM_EMAIL_RESENDING.full,
			)
				.send({ email: 'wrong-email@email.com' })
				.expect(HTTP_STATUSES.BAD_REQUEST_400)

			const resend = resendConfirmEmailRes.body
			checkErrorResponse(resend, 400, 'Email not found')
		})

		it('should return 201 if dto has correct values', async () => {
			const user = await userUtils.createUserWithConfirmedEmail(mainApp, userRepository)
			jest.clearAllMocks()

			const resendConfirmEmailRes = await postRequest(
				mainApp,
				RouteNames.AUTH.CONFIRM_EMAIL_RESENDING.full,
			)
				.send({ email: defUserEmail })
				.expect(HTTP_STATUSES.OK_200)
			const resend = resendConfirmEmailRes.body

			expect(emailAdapter.sendEmailConfirmationMessage).toBeCalledTimes(1)
			checkSuccessResponse(resend, 200)
		})
	})

	describe('User log out', () => {
		it('should return 401 if there is not cookies', async () => {
			await userUtils.deviceTokenChecks.tokenNotExist(
				mainApp,
				'post',
				RouteNames.AUTH.LOGOUT.full,
			)
		})

		it('should return 401 if the JWT refreshToken inside cookie is missing, expired or incorrect', async () => {
			await userUtils.deviceTokenChecks.tokenExpired(
				mainApp,
				'post',
				RouteNames.AUTH.LOGOUT.full,
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

			await postRequest(mainApp, RouteNames.AUTH.LOGOUT.full)
				.set('authorization', 'Bearer ' + accessToken)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshTokenValue)
				.expect(HTTP_STATUSES.OK_200)
		})
	})

	describe('Reset password', () => {
		it('should return 400 if email in body is not exist or has wrong format', async () => {
			const recoverRes = await postRequest(
				mainApp,
				RouteNames.AUTH.PASSWORD_RECOVERY.full,
			).expect(HTTP_STATUSES.BAD_REQUEST_400)

			const recover = recoverRes.body
			checkErrorResponse(recover, 400, 'Wrong body')

			expect({}.toString.call(recover.wrongFields)).toBe('[object Array]')
			expect(recover.wrongFields.length).toBe(2)
			const [emailFieldErrText] = getFieldInErrorObject(recover, ['email'])

			expect(emailFieldErrText).toBe('Email must be a string')
		})

		it('should return 400 if email is not registered and email is not be sent', async () => {
			const recoverRes = await postRequest(mainApp, RouteNames.AUTH.PASSWORD_RECOVERY.full)
				.send({ email: defUserEmail, recaptchaValue: 'recaptchaValue' })
				.expect(HTTP_STATUSES.BAD_REQUEST_400)

			const recover = recoverRes.body
			checkErrorResponse(recover, 400, 'User not found')
			expect(emailAdapter.sendPasswordRecoveryMessage).toBeCalledTimes(0)
		})

		it('should return 200 if email is registered and email is sent', async () => {
			const user = await userUtils.createUserWithConfirmedEmail(mainApp, userRepository)

			const recoverRes = await postRequest(mainApp, RouteNames.AUTH.PASSWORD_RECOVERY.full)
				.send({ email: user!.email, recaptchaValue: 'recaptchaValue' })
				.expect(HTTP_STATUSES.OK_200)

			const recover = recoverRes.body
			checkSuccessResponse(recover, 200)
			expect(emailAdapter.sendPasswordRecoveryMessage).toBeCalledTimes(1)
		})

		/*it('should return 400 if capcha is wrong', async () => {
			const user = await userUtils.createUserWithConfirmedEmail(mainApp, userRepository)

			reCaptchaAdapter.isValid = jest.fn().mockReturnValueOnce(false)
			const recoverRes = await postRequest(mainApp, RouteNames.AUTH.PASSWORD_RECOVERY.full)
				.send({ email: user!.email, recaptchaValue: 'recaptchaValue' })
				.expect(HTTP_STATUSES.BAD_REQUEST_400)

			const recover = recoverRes.body
			checkErrorResponse(recover, 400, 'Captcha is wrong')
		})*/
	})

	describe('Set new password', () => {
		it('should return 400 if email in body is not exist or has wrong format', async () => {
			const newPasswordRes = await postRequest(
				mainApp,
				RouteNames.AUTH.NEW_PASSWORD.full,
			).expect(HTTP_STATUSES.BAD_REQUEST_400)

			const newPassword = newPasswordRes.body
			checkErrorResponse(newPassword, 400, 'Wrong body')

			expect({}.toString.call(newPassword.wrongFields)).toBe('[object Array]')
			expect(newPassword.wrongFields.length).toBe(2)
			const [newPasswordFieldErrText, recoveryCodeFieldErrText] = getFieldInErrorObject(
				newPassword,
				['newPassword', 'recoveryCode'],
			)

			expect(newPasswordFieldErrText).toBe('NewPassword must be a string')
			expect(recoveryCodeFieldErrText).toBe('RecoveryCode must be a string')
		})

		it('should return 400 if user, who made request to reset password is not found', async () => {
			const newPasswordRes = await postRequest(mainApp, RouteNames.AUTH.NEW_PASSWORD.full)
				.send({ newPassword: 'my-new-password', recoveryCode: 'asdfghjkl' })
				.expect(HTTP_STATUSES.BAD_REQUEST_400)

			const newPassword = newPasswordRes.body
			checkErrorResponse(newPassword, 400, 'User not found')
		})

		it('should return 200 if user is really made request to reset password', async () => {
			const user = await userUtils.createUserWithConfirmedEmail(mainApp, userRepository)

			const recoverRes = await postRequest(mainApp, RouteNames.AUTH.PASSWORD_RECOVERY.full)
				.send({ email: user!.email, recaptchaValue: 'recaptchaValue' })
				.expect(HTTP_STATUSES.OK_200)

			const getUserRes = await userRepository.getUserById(user!.id)
			const { passwordRecoveryCode } = getUserRes!

			const myNewPassword = 'my-new-password'
			const newPasswordRes = await postRequest(mainApp, RouteNames.AUTH.NEW_PASSWORD.full)
				.send({ newPassword: myNewPassword, recoveryCode: passwordRecoveryCode })
				.expect(HTTP_STATUSES.OK_200)

			const newPassword = newPasswordRes.body
			checkSuccessResponse(newPassword, 200)

			// Try login with the new password
			await postRequest(mainApp, RouteNames.AUTH.LOGIN.full)
				.send({ password: myNewPassword, email: defUserEmail })
				.expect(HTTP_STATUSES.OK_200)
		})
	})

	describe('Get new refresh and access token', () => {
		it('should return 401 if there is not cookies', async () => {
			await userUtils.deviceTokenChecks.tokenNotExist(
				mainApp,
				'post',
				RouteNames.AUTH.REFRESH_TOKEN.full,
			)
		})

		it('should return 401 if the JWT refreshToken inside cookie is missing, expired or incorrect', async () => {
			await userUtils.deviceTokenChecks.tokenExpired(
				mainApp,
				'post',
				RouteNames.AUTH.REFRESH_TOKEN.full,
				userRepository,
				securityRepository,
				jwtService,
				mainConfig,
			)
		})

		it('should return 200 if the JWT refreshToken inside cookie is valid', async () => {
			await userUtils.deviceTokenChecks.tokenValid(
				mainApp,
				RouteNames.AUTH.REFRESH_TOKEN.full,
				userRepository,
				mainConfig,
			)
		})
	})

	describe('Sign up with Github or Google', () => {
		it('return 400 if provider name is wrong', async () => {
			const registerRes = await getRequest(
				mainApp,
				RouteNames.AUTH.REGISTRATION.BY_PROVIDER.full + '?provider=wrong&code=123',
			).expect(HTTP_STATUSES.BAD_REQUEST_400)
		})

		it('register a new user by Github and Google', async () => {
			const providerNames = ['github', 'google']

			for (const providerName of providerNames) {
				const registerRes = await getRequest(
					mainApp,
					RouteNames.AUTH.REGISTRATION.BY_PROVIDER.full +
						`?provider=${providerName}&code=123`,
				).expect(HTTP_STATUSES.OK_200)

				const cookies = registerRes.headers['set-cookie']
				expect(cookies[0].startsWith('refreshToken')).toBe(true)
				const refreshToken = cookies[0].split('=')[1]

				const register = registerRes.body
				checkSuccessResponse(register, 200)
				expect(typeof register.data.accessToken).toBe('string')

				const { accessToken } = register.data

				// Try to log out with this refreshToken
				const logoutRes = await postRequest(mainApp, RouteNames.AUTH.LOGOUT.full)
					.set('authorization', 'Bearer ' + accessToken)
					.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshToken)
					.expect(HTTP_STATUSES.OK_200)
			}
		})

		it('register an existing user by Github', async () => {
			const user = await userUtils.createUserWithUnconfirmedEmail(mainApp, userRepository)

			const registerRes = await getRequest(
				mainApp,
				RouteNames.AUTH.REGISTRATION.BY_PROVIDER.full + '?provider=github&code=123',
			).expect(HTTP_STATUSES.OK_200)

			// Check if user has confirmed email
			const updatedUser = await userRepository.getUserById(user!.id)
			expect(updatedUser!.githubId).not.toBeNull()
			expect(updatedUser!.isEmailConfirmed).toBeTruthy()
			expect(updatedUser!.emailConfirmationCode).toBeNull()
			expect(updatedUser!.confirmationCodeExpirationDate).toBeNull()

			// Check refreshToken in cookie
			const cookies = registerRes.headers['set-cookie']
			expect(cookies[0].startsWith('refreshToken')).toBe(true)
			const refreshToken = cookies[0].split('=')[1]

			const register = registerRes.body
			checkSuccessResponse(register, 200)

			userUtils.checkUserOutModel(register.data.user)

			// Check accessToken in cookie
			expect(typeof register.data.accessToken).toBe('string')

			// Try to log out with this refreshToken
			const logoutRes = await postRequest(mainApp, RouteNames.AUTH.LOGOUT.full)
				.set('authorization', 'Bearer ' + registerRes.body.data.accessToken)
				.set('Cookie', mainConfig.get().refreshToken.name + '=' + refreshToken)
				.expect(HTTP_STATUSES.OK_200)
		})
	})
})
