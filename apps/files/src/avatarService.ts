import { Injectable } from '@nestjs/common'
import {
	ErrorMessage,
	FileMS_DeleteUserAvatarOutContract,
	FileMS_GetUserAvatarInContract,
	FileMS_GetUserAvatarOutContract,
	FileMS_GetUsersAvatarsInContract,
	FileMS_GetUsersAvatarsOutContract,
	FileMS_SaveUserAvatarInContract,
} from '@app/shared'
import {
	FileMS_DeleteUserAvatarInContract,
	FileMS_SaveUserAvatarOutContract,
} from '@app/shared/contracts/fileMS.contracts'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { UserAvatar } from './schemas/userAvatar.schema'
import { CommonService, SaveFileDetails } from './commonService'
import { MainConfigService } from '@app/config'

@Injectable()
export class AvatarService {
	constructor(
		private commonService: CommonService,
		private mainConfig: MainConfigService,
		@InjectModel(UserAvatar.name) private userAvatarModel: Model<UserAvatar>,
	) {}

	async saveUserAvatar(
		saveUserAvatarInContract: FileMS_SaveUserAvatarInContract,
	): Promise<FileMS_SaveUserAvatarOutContract> {
		const { userId, avatarFile } = saveUserAvatarInContract

		// Avatar details
		const fileExtension = this.commonService.getFileExtension(avatarFile)
		const avatarUrl = 'users/' + userId + '/avatar.' + fileExtension

		// Save the file to S3
		try {
			const setUserAvatarContract: SaveFileDetails = {
				mimetype: avatarFile.mimetype,
				filePath: avatarUrl,
				fileBuffer: avatarFile.buffer,
				fileSize: avatarFile.size,
			}

			await this.commonService.saveFile(setUserAvatarContract)
		} catch (error: any) {
			throw new Error(ErrorMessage.CannotSaveFile)
		}

		// Save details in DB
		const existingAvatarInDb = await this.userAvatarModel.exists({ userId })

		if (existingAvatarInDb) {
			await this.userAvatarModel.findByIdAndUpdate(existingAvatarInDb._id, {
				url: avatarUrl,
			})
		} else {
			await this.userAvatarModel.create<UserAvatar>({
				url: avatarUrl,
				userId,
			})
		}

		return {
			avatarUrl,
		}
	}

	async getUsersAvatars(
		getUsersAvatarsInContract: FileMS_GetUsersAvatarsInContract,
	): Promise<FileMS_GetUsersAvatarsOutContract> {
		const { usersIds } = getUsersAvatarsInContract

		const usersAvatars = await this.userAvatarModel.find({ userId: { $in: usersIds } })

		const preparedUsersAvatars: FileMS_GetUsersAvatarsOutContract = []

		usersAvatars.forEach((userAvatar) => {
			let postInPreparedPosts = findPostInPreparedPosts(
				preparedUsersAvatars,
				userAvatar.userId,
			)

			if (!postInPreparedPosts) {
				preparedUsersAvatars.push({ userId: userAvatar.userId, avatarUrl: userAvatar.url })
			}

			postInPreparedPosts = findPostInPreparedPosts(preparedUsersAvatars, userAvatar.userId)
			postInPreparedPosts!.avatarUrl =
				this.mainConfig.get().s3.filesRootUrl + '/' + userAvatar.url
		})

		return preparedUsersAvatars

		function findPostInPreparedPosts(
			preparedUsersAvatars: FileMS_GetUsersAvatarsOutContract,
			userId: number,
		) {
			return preparedUsersAvatars.find((thisPost) => thisPost.userId === userId)
		}
	}

	async getUserAvatar(
		getUserAvatarInContract: FileMS_GetUserAvatarInContract,
	): Promise<FileMS_GetUserAvatarOutContract> {
		const { userId } = getUserAvatarInContract

		const avatarDetails = await this.userAvatarModel.findOne({ userId })

		if (avatarDetails) {
			return {
				avatarUrl: this.mainConfig.get().s3.filesRootUrl + '/' + avatarDetails.url,
			}
		}

		return {
			avatarUrl: null,
		}
	}

	async deleteUserAvatar(
		deleteUserAvatarInContract: FileMS_DeleteUserAvatarInContract,
	): Promise<FileMS_DeleteUserAvatarOutContract> {
		const { userId } = deleteUserAvatarInContract

		const existingAvatarInDb = await this.userAvatarModel.findOne({ userId })

		if (existingAvatarInDb) {
			await this.commonService.deleteFile(existingAvatarInDb.url)

			// Remove user avatar details in DB
			await this.userAvatarModel.deleteOne({ userId })
		}

		return null
	}
}
