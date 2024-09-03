import { INestApplication } from '@nestjs/common'
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
import { HTTP_STATUSES } from '../src/settings/config'
import { clearAllDB } from './utils/db'
import { EmailAdapterService } from '@app/email-adapter'
import { UserRepository } from '../src/repositories/user.repository'

it.only('123', async () => {
	expect(2).toBe(2)
})

describe('Auth (e2e)', () => {
	let app: INestApplication
	let emailAdapter: EmailAdapterService

	let userRepository: UserRepository
	// const jwtService = new JwtService()

	beforeAll(async () => {
		const createAppRes = await createTestApp(emailAdapter)
		app = createAppRes.app
		emailAdapter = createAppRes.emailAdapter
		userRepository = await app.resolve(UserRepository)
	})

	beforeEach(async () => {
		await clearAllDB(app)
	})

	describe('Register user', () => {
		it('should return 400 if dto has incorrect values', async () => {
			await postRequest(app, RouteNames.AUTH.REGISTRATION.full).expect(
				HTTP_STATUSES.BAD_REQUEST_400,
			)

			const registrationRes = await postRequest(app, RouteNames.AUTH.REGISTRATION.full)
				.send({ name: '', password: '', email: 'wrong-email.com' })
				.expect(HTTP_STATUSES.BAD_REQUEST_400)

			const reg = registrationRes.body

			expect(reg.status).toBe('error')
			expect(reg.code).toBe(HTTP_STATUSES.BAD_REQUEST_400)

			expect({}.toString.call(reg.wrongFields)).toBe('[object Array]')
			expect(reg.wrongFields.length).toBe(3)

			const [nameFieldErrText, passwordFieldErrText, emailFieldErrText] =
				getFieldInErrorObject(reg, ['name', 'password', 'email'])

			expect(nameFieldErrText).toBe('Minimum number of characters 6')
			expect(passwordFieldErrText).toBe('Minimum number of characters 6')
			expect(emailFieldErrText).toBe('The email must match the format example@example.com')
		})

		it('should return an error if the entered email is registered already', async () => {
			const firstRegRes = await postRequest(app, RouteNames.AUTH.REGISTRATION.full)
				.send({
					name: userName,
					password: userPassword,
					email: userEmail,
				})
				.expect(HTTP_STATUSES.CREATED_201)

			const secondRegRes = await postRequest(app, RouteNames.AUTH.REGISTRATION.full)
				.send({ name: userName, password: userPassword, email: userEmail })
				.expect(HTTP_STATUSES.BAD_REQUEST_400)

			const secondReg = secondRegRes.body
			checkErrorResponse(secondReg, 400, 'Email or username is already registered')
		})

		it('should return 201 if dto has correct values', async () => {
			const registrationRes = await postRequest(app, RouteNames.AUTH.REGISTRATION.full)
				.send({ name: userName, password: userPassword, email: userEmail })
				.expect(HTTP_STATUSES.CREATED_201)

			expect(emailAdapter.sendEmailConfirmationMessage).toBeCalled()
		})

		it('should return 201 if tries to register an user with existed, but unconfirmed email', async () => {
			await postRequest(app, RouteNames.AUTH.REGISTRATION.full)
				.send({ name: userName, password: userPassword, email: userEmail })
				.expect(HTTP_STATUSES.CREATED_201)

			await postRequest(app, RouteNames.AUTH.REGISTRATION.full)
				.send({
					name: userName,
					password: userPassword,
					email: userEmail,
				})
				.expect(HTTP_STATUSES.CREATED_201)
		})

		it('should return 400 if they try to register a user with a verified email', async () => {
			const registrationRes = await postRequest(app, RouteNames.AUTH.REGISTRATION.full)
				.send({ name: userName, password: userPassword, email: userEmail })
				.expect(HTTP_STATUSES.CREATED_201)

			// Make email verified
			await userRepository.makeEmailVerified(registrationRes.body.data.id)

			await postRequest(app, RouteNames.AUTH.REGISTRATION.full)
				.send({
					name: userName,
					password: userPassword,
					email: userEmail,
				})
				.expect(HTTP_STATUSES.BAD_REQUEST_400)
		})
	})

	describe('Confirm email', () => {
		it('should return 400 if dto has incorrect values', async () => {
			const confirmationRes = await getRequest(
				app,
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
			const firstRegRes = await postRequest(app, RouteNames.AUTH.REGISTRATION.full)
				.send({ name: userName, password: userPassword, email: userEmail })
				.expect(HTTP_STATUSES.CREATED_201)

			// Try to confirm email with a wrong confirmation code
			const confirmEmailRes = await getRequest(
				app,
				RouteNames.AUTH.EMAIL_CONFIRMATION.full + '?code=' + 'WRONG__$1Hn[595n8]T',
			).expect(HTTP_STATUSES.BAD_REQUEST_400)

			const confirmEmail = confirmEmailRes.body
			checkErrorResponse(confirmEmail, 400, 'Email confirmation code not found')
		})

		it('should return 400 if email verification allowed time is over', async () => {
			const firstRegRes = await postRequest(app, RouteNames.AUTH.REGISTRATION.full)
				.send({ name: userName, password: userPassword, email: userEmail })
				.expect(HTTP_STATUSES.CREATED_201)

			const userId = firstRegRes.body.data.id

			const user = await userRepository.getUserById(userId)

			// Change email confirmation allowed time to past
			await userRepository.updateUser(userId, {
				email_confirmation_code_expiration_date: new Date().toISOString(),
			})

			// Try to confirm email
			const confirmEmailRes = await getRequest(
				app,
				RouteNames.AUTH.EMAIL_CONFIRMATION.full + '?code=' + user!.emailConfirmationCode,
			).expect(HTTP_STATUSES.BAD_REQUEST_400)

			const confirmEmail = confirmEmailRes.body
			checkErrorResponse(confirmEmail, 400, 'Email confirmation code is expired')
		})

		it('should return 200 if email successfully confirmed', async () => {
			const firstRegRes = await postRequest(app, RouteNames.AUTH.REGISTRATION.full)
				.send({ name: userName, password: userPassword, email: userEmail })
				.expect(HTTP_STATUSES.CREATED_201)

			const userId = firstRegRes.body.data.id

			const user = await userRepository.getUserById(userId)

			// Try to confirm email
			const confirmEmailRes = await getRequest(
				app,
				RouteNames.AUTH.EMAIL_CONFIRMATION.full + '?code=' + user!.emailConfirmationCode,
			).expect(HTTP_STATUSES.OK_200)

			const confirmEmail = confirmEmailRes.body
			checkSuccessResponse(confirmEmail, 200, null)
		})

		it('should return 400 if they tries confirm email second time', async () => {
			const firstRegRes = await postRequest(app, RouteNames.AUTH.REGISTRATION.full)
				.send({ name: userName, password: userPassword, email: userEmail })
				.expect(HTTP_STATUSES.CREATED_201)

			const userId = firstRegRes.body.data.id
			const user = await userRepository.getUserById(userId)

			// Confirm email
			await getRequest(
				app,
				RouteNames.AUTH.EMAIL_CONFIRMATION.full + '?code=' + user!.emailConfirmationCode,
			)
				.send({
					code: user!.emailConfirmationCode,
				})
				.expect(HTTP_STATUSES.OK_200)

			// Try to confirm email second time
			const confirmEmailSecondTimeRes = await getRequest(
				app,
				RouteNames.AUTH.EMAIL_CONFIRMATION.full + '?code=' + user!.emailConfirmationCode,
			).expect(HTTP_STATUSES.BAD_REQUEST_400)

			const confirmEmailSecondTime = confirmEmailSecondTimeRes.body
			checkErrorResponse(confirmEmailSecondTime, 400, 'Email confirmation code not found')
		})
	})
})
