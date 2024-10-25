import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { AvatarService } from './avatarService'
import {
	FileMS_DeletePostImagesInContract,
	FileMS_EventNames,
	FileMS_GetUserAvatarInContract,
	FileMS_SaveUserAvatarInContract,
} from '@app/shared'
import {
	FileMS_DeleteFileInContract,
	FileMS_SavePostImagesInContract,
} from '@app/shared/contracts/fileMS.contracts'
import { PostService } from './postService'

@Controller()
export class FilesController {
	constructor(
		private readonly avatarService: AvatarService,
		private readonly postService: PostService,
	) {}

	@MessagePattern(FileMS_EventNames.SaveUserAvatar)
	async saveUserAvatar(saveUserAvatarInContract: FileMS_SaveUserAvatarInContract) {
		return await this.avatarService.saveUserAvatar(saveUserAvatarInContract)
	}

	@MessagePattern(FileMS_EventNames.GetUserAvatar)
	async getUserAvatar(getUserAvatarInContract: FileMS_GetUserAvatarInContract) {
		return await this.avatarService.getUserAvatar(getUserAvatarInContract)
	}

	@MessagePattern(FileMS_EventNames.DeleteUserAvatar)
	async deleteUserAvatar(deleteUserAvatarInContract: FileMS_DeleteFileInContract) {
		return await this.avatarService.deleteUserAvatar(deleteUserAvatarInContract)
	}

	@MessagePattern(FileMS_EventNames.SavePostImages)
	async savePostImages(savePostImagesInContract: FileMS_SavePostImagesInContract) {
		return await this.postService.savePostImages(savePostImagesInContract)
	}

	@MessagePattern(FileMS_EventNames.DeletePostImages)
	async deletePostImages(deletePostImagesInContract: FileMS_DeletePostImagesInContract) {
		return await this.postService.deletePostImages(deletePostImagesInContract)
	}
}
