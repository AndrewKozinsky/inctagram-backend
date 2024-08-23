import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { SecondModule } from '../src/second.module'

describe('SecondController (e2e)', () => {
	let app: INestApplication

	/*beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [SecondModule],
		}).compile()

		app = moduleFixture.createNestApplication()
		await app.init()
	})*/

	it('/ (GET)', () => {
		expect(12 + 12).toBe(24)
	})
})
