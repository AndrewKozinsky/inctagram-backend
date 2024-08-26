import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '../../../src/app.module'
import { applyAppSettings } from '../../../src/settings/applyAppSettings'
import { agent as request } from 'supertest'
import { INestApplication } from '@nestjs/common'

export const adminAuthorizationValue = 'Basic YWRtaW46cXdlcnR5'
export const userLogin = 'my-login'
export const userEmail = 'mail@email.com'
export const userPassword = 'password'

export async function createTestApp() {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile()

	const app = moduleFixture.createNestApplication()
	applyAppSettings(app)
	await app.init()

	return app
}

export function postRequest(app: INestApplication, url: string) {
	return request(app.getHttpServer()).post('/' + url)
}
