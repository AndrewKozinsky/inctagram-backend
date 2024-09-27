import { Test, TestingModule } from '@nestjs/testing'
import { FilesController } from './filesController'
import { FilesService } from './filesService'

describe('SecondController', () => {
	let secondController: FilesController

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [FilesController],
			providers: [FilesService],
		}).compile()

		secondController = app.get<FilesController>(FilesController)
	})

	describe('root', () => {
		it('should return "Hello World!"', () => {
			expect(secondController.getHello()).toBe('Hello World!')
		})
	})
})
