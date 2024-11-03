import { agent as request } from 'supertest'
import { INestApplication } from '@nestjs/common'
import { of } from 'rxjs'
import { ClientProxy } from '@nestjs/microservices'

export const adminAuthorizationValue = 'Basic YWRtaW46cXdlcnR5'
export const defUserName = 'myUserName'
export const defUserEmail = 'mail@email.com'
export const defUserPassword = 'password'

export function postRequest(app: INestApplication, url: string) {
	return request(app.getHttpServer()).post('/' + url)
}

export function getRequest(app: INestApplication, url: string) {
	return request(app.getHttpServer()).get('/' + url)
}

export function putRequest(app: INestApplication, url: string) {
	return request(app.getHttpServer()).put('/' + url)
}

export function patchRequest(app: INestApplication, url: string) {
	return request(app.getHttpServer()).patch('/' + url)
}

export function deleteRequest(app: INestApplication, url: string) {
	return request(app.getHttpServer()).delete('/' + url)
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

export function checkSuccessResponse(resObj: any, code: number, expectedData?: any) {
	expect(resObj.status).toBe('success')
	expect(resObj.code).toBe(code)

	if (expectedData) {
		expect(resObj.data).toEqual(expectedData)
	}
}

export function mockFilesServiceSendMethod(filesMicroservice: ClientProxy, returnValue: any) {
	;(filesMicroservice.send as jest.Mock).mockImplementation(() => {
		return of(returnValue)
	})
}
export function mockFilesServiceSendMethodOnce(filesMicroservice: ClientProxy, returnValue: any) {
	;(filesMicroservice.send as jest.Mock).mockImplementationOnce(() => {
		return of(returnValue)
	})
}

export function resetMockFilesServiceSendMethod(filesMicroservice: ClientProxy) {
	;(filesMicroservice.send as jest.Mock).mockReset()
}
