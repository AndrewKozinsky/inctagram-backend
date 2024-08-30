import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '../src/app.module'
import { describe } from 'node:test'
import {
	createTestApp,
	getFieldInErrorObject,
	postRequest,
	userEmail,
	userLogin,
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
		it('should return 400 if dto has incorrect values', async () => {
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

		it.only('should return 201 if dto has correct values', async () => {
			// EmailAdapterService.
			const registrationRes = await postRequest(app, RouteNames.AUTH.REGISTRATION.full)
				.send({ name: userLogin, password: userPassword, email: userEmail })
				.expect(HTTP_STATUSES.CREATED_201)

			expect(emailAdapter.sendEmailConfirmationMessage).toBeCalled()
			// console.log(registrationRes.body)
		})
	})
})
