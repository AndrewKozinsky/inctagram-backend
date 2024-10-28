import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { AvatarService } from './avatarService'
import {
	FileMS_DeletePostImagesInContract,
	FileMS_EventNames,
	FileMS_GetPostImagesInContract,
	FileMS_GetPostsImagesInContract,
	FileMS_GetUserAvatarInContract,
	FileMS_SaveUserAvatarInContract,
} from '@app/shared'
import {
	FileMS_DeleteUserAvatarInContract,
	FileMS_SavePostImagesInContract,
} from '@app/shared/contracts/fileMS.contracts'
import { PostPhotoService } from './postPhotoService'
import { CommonService } from './commonService'

@Controller()
export class FilesController {
	constructor(
		private readonly commonService: CommonService,
		private readonly avatarService: AvatarService,
		private readonly postService: PostPhotoService,
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
	async deleteUserAvatar(deleteUserAvatarInContract: FileMS_DeleteUserAvatarInContract) {
		return await this.avatarService.deleteUserAvatar(deleteUserAvatarInContract)
	}

	@MessagePattern(FileMS_EventNames.SavePostImages)
	async savePostImages(savePostImagesInContract: FileMS_SavePostImagesInContract) {
		return await this.postService.savePostImages(savePostImagesInContract)
	}

	@MessagePattern(FileMS_EventNames.GetPostsImages)
	async getPostsImages(getPostsImagesInContract: FileMS_GetPostsImagesInContract) {
		return await this.postService.getPostsImages(getPostsImagesInContract)
	}

	@MessagePattern(FileMS_EventNames.GetPostImages)
	async getPostImages(getPostImagesInContract: FileMS_GetPostImagesInContract) {
		return await this.postService.getPostImages(getPostImagesInContract)
	}

	@MessagePattern(FileMS_EventNames.DeletePostImages)
	async deletePostImages(deletePostImagesInContract: FileMS_DeletePostImagesInContract) {
		return await this.postService.deletePostImages(deletePostImagesInContract)
	}

	@MessagePattern(FileMS_EventNames.EraseDatabase)
	async eraseDatabase() {
		return await this.commonService.eraseDatabase()
	}
}
