import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { FilesService } from './filesService'
import { FileMS_EventNames, FileMS_SaveUserAvatarInContract } from '@app/shared'
import { FileMS_SavePostImagesInContract } from '@app/shared/contracts/fileMS.contracts'

@Controller()
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	@MessagePattern(FileMS_EventNames.SaveUserAvatar)
	async saveUserAvatar(saveUserAvatarInContract: FileMS_SaveUserAvatarInContract) {
		return await this.filesService.saveUserAvatar(saveUserAvatarInContract)
	}

	@MessagePattern(FileMS_EventNames.SavePostImages)
	async savePostImages(savePostImagesInContract: FileMS_SavePostImagesInContract) {
		return await this.filesService.savePostImages(savePostImagesInContract)
	}
}
