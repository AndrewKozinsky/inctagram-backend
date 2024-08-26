import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../../src/app.module'
import { describe } from 'node:test'
import { createTestApp } from './utils/common'
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
		it.only('should return 400 if dto has incorrect values', async () => {
			const registrationRes = await request(app.getHttpServer())
				.post('/' + RouteNames.AUTH.REGISTRATION.full)
				.send({ login: '', password: '', email: 'wrong-email.com' })
				.expect(HTTP_STATUSES.BAD_REQUEST_400)

			expect({}.toString.call(registrationRes.body.errorsMessages)).toBe('[object Array]')
			expect(registrationRes.body.errorsMessages.length).toBe(3)
		})
	})

	// DELETE !!!
	/*beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile()

		app = moduleFixture.createNestApplication()
		await app.init()
	})*/
})
