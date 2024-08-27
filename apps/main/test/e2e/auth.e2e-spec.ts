import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '../../src/app.module'
import { describe } from 'node:test'
import { createTestApp, postRequest, userEmail, userLogin, userPassword } from './utils/common'
import RouteNames from '../../src/settings/routeNames'
import { HTTP_STATUSES } from '../../src/settings/config'

it('123', async () => {
	expect(2).toBe(2)
})

describe('Auth (e2e)', () => {
	let app: INestApplication
	// let authRepository: AuthRepository
	// let usersRepository: UsersRepository
	// const jwtService = new JwtService()

	beforeAll(async () => {
		app = await createTestApp()
		// authRepository = await app.resolve(AuthRepository)
		// usersRepository = await app.resolve(UsersRepository)
	})

	beforeEach(async () => {
		// await clearAllDB(app)
	})

	describe('Register user', () => {
		it('should return 400 if dto has incorrect values', async () => {
			const registrationRes = await postRequest(app, RouteNames.AUTH.REGISTRATION.full)
				.send({ name: '', password: '', email: 'wrong-email.com' })
				.expect(HTTP_STATUSES.BAD_REQUEST_400)
			console.log(registrationRes.body)

			expect({}.toString.call(registrationRes.body.errorsMessages)).toBe('[object Array]')
			expect(registrationRes.body.errorsMessages.length).toBe(3)
		})

		it.only('should return 201 if dto has correct values', async () => {
			const registrationRes = await postRequest(app, RouteNames.AUTH.REGISTRATION.full)
				.send({ name: userLogin, password: userPassword, email: userEmail })
				.expect(HTTP_STATUSES.CREATED_201)
			console.log(registrationRes.body)
		})
	})
})
