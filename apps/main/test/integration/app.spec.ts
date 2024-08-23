import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../../src/features/app.module'

describe('Numbers sum', () => {
	let app: INestApplication

	/*beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile()

		app = moduleFixture.createNestApplication()
		await app.init()
	})*/

	it('3 + 3', () => {
		// return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!')
		expect(3 + 3).toBe(6)
	})
})
