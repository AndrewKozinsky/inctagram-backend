import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { FilesService } from './filesService'
import { FileEventNames, SaveFileInContract } from './contracts/contracts'

@Controller()
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	@MessagePattern(FileEventNames.Save)
	async save(fileData: SaveFileInContract) {
		return await this.filesService.save(fileData)
	}

	@MessagePattern(FileEventNames.Delete)
	async delete(filePath: string) {
		return await this.filesService.delete(filePath)
	}
}
