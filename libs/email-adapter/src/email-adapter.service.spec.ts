import { Test, TestingModule } from '@nestjs/testing'
import { EmailAdapterService } from './email-adapter.service'

describe('EmailAdapterService', () => {
	let service: EmailAdapterService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [EmailAdapterService],
		}).compile()

		service = module.get<EmailAdapterService>(EmailAdapterService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})
})
