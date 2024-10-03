import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { FilesService } from './filesService'
import { FileEventNames, SaveUserAvatarInContract } from './contracts/contracts'

@Controller()
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	@MessagePattern(FileEventNames.SaveUserAvatar)
	async saveUserAvatar(saveUserAvatarInContract: SaveUserAvatarInContract) {
		return await this.filesService.saveUserAvatar(saveUserAvatarInContract)
	}
}
