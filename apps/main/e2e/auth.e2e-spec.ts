import { INestApplication } from '@nestjs/common'
import {
	checkErrorResponse,
	createTestApp,
	getFieldInErrorObject,
	postRequest,
	userEmail,
	userName,
	userPassword,
} from './utils/common'
import RouteNames from '../src/settings/routeNames'
import { HTTP_STATUSES } from '../src/settings/config'
import { clearAllDB } from './utils/db'
import { EmailAdapterService } from '@app/email-adapter'

it('123', async () => {
	expect(2).toBe(2)
})

describe('Auth (e2e)', () => {
	let app: INestApplication
	let emailAdapter: EmailAdapterService

	// let authRepository: AuthRepository
	// let usersRepository: UsersRepository
	// const jwtService = new JwtService()

	beforeAll(async () => {
		const createAppRes = await createTestApp(emailAdapter)
		app = createAppRes.app
		emailAdapter = createAppRes.emailAdapter
		// authRepository = await app.resolve(AuthRepository)
		// usersRepository = await app.resolve(UsersRepository)
	})

	beforeEach(async () => {
		await clearAllDB(app)
	})

	describe('Register user', () => {
		it.only('should return 400 if dto has incorrect values', async () => {
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
			// EmailAdapterService.
			const registrationRes = await postRequest(app, RouteNames.AUTH.REGISTRATION.full)
				.send({ name: userName, password: userPassword, email: userEmail })
				.expect(HTTP_STATUSES.CREATED_201)

			expect(emailAdapter.sendEmailConfirmationMessage).toBeCalled()
			// console.log(registrationRes.body)
		})
	})
})
