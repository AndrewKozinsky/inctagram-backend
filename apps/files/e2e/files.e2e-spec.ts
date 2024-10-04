import { INestMicroservice } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { createFilesApp, createEmitApp } from './utils/createEmitAppAndFilesApp'

it.only('123', async () => {
	expect(2).toBe(2)
})

describe('Auth (e2e)', () => {
	let emitApp: ClientProxy
	let filesApp: INestMicroservice

	beforeAll(async () => {
		emitApp = await createEmitApp()
		filesApp = await createFilesApp()
	})

	beforeEach(async () => {})

	afterEach(() => {
		jest.clearAllMocks()
	})

	afterAll(async () => {
		await emitApp.close()
		await filesApp.close()
	})

	/*it('should respond to the request', async () => {
		// Send a request to the microservice
		const pattern = { cmd: 'getData' }
		const payload = { id: 123 }

		const response = await emitApp.send(pattern, payload).toPromise()

		// Assert the response
		expect(response).toEqual({ id: 123, data: 'Sample Data' })
	})*/
})
