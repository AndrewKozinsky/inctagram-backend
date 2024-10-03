import { INestMicroservice } from '@nestjs/common'
import { createFilesApp } from './utils/createApp'

it.only('123', async () => {
	expect(2).toBe(2)
})

describe('Auth (e2e)', () => {
	let filesApp: INestMicroservice

	beforeAll(async () => {
		const createFilesAppRes = await createFilesApp()
		filesApp = createFilesAppRes.filesApp
	})

	beforeEach(async () => {})

	afterEach(() => {
		jest.clearAllMocks()
	})
})
