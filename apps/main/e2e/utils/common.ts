import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '../../src/app.module'
import { applyAppSettings } from '../../src/settings/applyAppSettings'
import { agent as request } from 'supertest'
import { INestApplication } from '@nestjs/common'
import { EmailAdapterService } from '@app/email-adapter'

export const adminAuthorizationValue = 'Basic YWRtaW46cXdlcnR5'
export const userName = 'my-user-name'
export const userEmail = 'mail@email.com'
export const userPassword = 'password'

export async function createTestApp(emailAdapter: EmailAdapterService) {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	})
		.overrideProvider(EmailAdapterService)
		.useValue({
			sendEmailConfirmationMessage: jest.fn().mockResolvedValue('Mocked Email Response'),
			sendEmail: jest.fn().mockResolvedValue('Mocked Email Response'),
			// You can mock other methods if needed
		})
		.compile()

	const app = moduleFixture.createNestApplication()
	applyAppSettings(app)
	await app.init()

	emailAdapter = moduleFixture.get<EmailAdapterService>(EmailAdapterService)

	return { app, emailAdapter }
}

export function postRequest(app: INestApplication, url: string) {
	return request(app.getHttpServer()).post('/' + url)
}

export function getRequest(app: INestApplication, url: string) {
	return request(app.getHttpServer()).get('/' + url)
}

/**
 * Get an object like
 * {
 *  wrongFields?: { field: 'email'; message: 'Wrong email' }[]
 * }
 * and find a wrongField object by field name
 * @param errObj
 * @param fieldNames
 */
export function getFieldInErrorObject(errObj: any, fieldNames: string | string[]) {
	try {
		if (typeof fieldNames === 'string') {
			return getFieldText(errObj, fieldNames)
		} else {
			return fieldNames.map((fieldName) => {
				return getFieldText(errObj, fieldName)
			})
		}
	} catch (err: unknown) {
		return null
	}

	function getFieldText(errObj: any, fieldName: string) {
		// @ts-ignore
		const field = errObj.wrongFields.find((field) => field.field === fieldName)

		return field.message
	}
}

export function checkErrorResponse(errObj: any, code: number, message: string) {
	expect(errObj.status).toBe('error')
	expect(errObj.code).toBe(code)
	expect(errObj.message).toBe(message)
}

export function checkSuccessResponse(resObj: any, code: number, data: any) {
	expect(resObj.status).toBe('success')
	expect(resObj.code).toBe(code)
	expect(resObj.data).toBe(data)
}
