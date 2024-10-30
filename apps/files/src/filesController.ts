import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { AvatarService } from './avatarService'
import {
	FileMS_DeletePostPhotoInContract,
	FileMS_EventNames,
	FileMS_GetPostPhotosInContract,
	FileMS_GetUserAvatarInContract,
	FileMS_GetUsersAvatarsInContract,
	FileMS_SavePostPhotoInContract,
	FileMS_SaveUserAvatarInContract,
} from '@app/shared'
import { FileMS_DeleteUserAvatarInContract } from '@app/shared/contracts/fileMS.contracts'
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

	@MessagePattern(FileMS_EventNames.GetUsersAvatars)
	async getUsersAvatar(getUsersAvatarsInContract: FileMS_GetUsersAvatarsInContract) {
		return await this.avatarService.getUsersAvatars(getUsersAvatarsInContract)
	}

	@MessagePattern(FileMS_EventNames.GetUserAvatar)
	async getUserAvatar(getUserAvatarInContract: FileMS_GetUserAvatarInContract) {
		return await this.avatarService.getUserAvatar(getUserAvatarInContract)
	}

	@MessagePattern(FileMS_EventNames.DeleteUserAvatar)
	async deleteUserAvatar(deleteUserAvatarInContract: FileMS_DeleteUserAvatarInContract) {
		return await this.avatarService.deleteUserAvatar(deleteUserAvatarInContract)
	}

	@MessagePattern(FileMS_EventNames.SavePostPhoto)
	async savePostPhoto(savePostPhotoInContract: FileMS_SavePostPhotoInContract) {
		return await this.postService.savePostPhoto(savePostPhotoInContract)
	}

	/*@MessagePattern(FileMS_EventNames.GetPostsPhotos)
	async getPostsPhotos(getPostsPhotosInContract: FileMS_GetPostsPhotosInContract) {
		return await this.postService.getPostsPhotos(getPostsPhotosInContract)
	}*/

	@MessagePattern(FileMS_EventNames.GetPostPhotos)
	async getPostPhotos(getPostPhotosByIdsInContract: FileMS_GetPostPhotosInContract) {
		return await this.postService.getPostPhotos(getPostPhotosByIdsInContract)
	}

	@MessagePattern(FileMS_EventNames.DeletePostPhoto)
	async deletePostPhoto(deletePostPhotoInContract: FileMS_DeletePostPhotoInContract) {
		return await this.postService.deletePostPhoto(deletePostPhotoInContract)
	}

	@MessagePattern(FileMS_EventNames.EraseDatabase)
	async eraseDatabase() {
		return await this.commonService.eraseDatabase()
	}
}
