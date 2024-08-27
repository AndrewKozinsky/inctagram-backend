import { Test, TestingModule } from '@nestjs/testing'
import { ServerHelperService } from './server-helper.service'

describe('ServerLibraryService', () => {
	let service: ServerHelperService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ServerHelperService],
		}).compile()

		service = module.get<ServerHelperService>(ServerHelperService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})
})
