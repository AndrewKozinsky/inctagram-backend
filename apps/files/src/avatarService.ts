import { Injectable } from '@nestjs/common'
import {
	ErrorMessage,
	FileMS_GetUserAvatarInContract,
	FileMS_GetUserAvatarOutContract,
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

@Injectable()
export class AvatarService {
	constructor(
		private commonService: CommonService,
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
		let avatarIdInDb = ''
		if (existingAvatarInDb) {
			avatarIdInDb = existingAvatarInDb._id.toString()
		} else {
			const res = await this.userAvatarModel.create<UserAvatar>({
				url: avatarUrl,
				userId,
			})

			avatarIdInDb = res._id.toString()
		}

		return {
			avatarId: avatarIdInDb,
			avatarUrl,
		}
	}

	async getUserAvatar(
		getUserAvatarInContract: FileMS_GetUserAvatarInContract,
	): Promise<FileMS_GetUserAvatarOutContract> {
		const { userId } = getUserAvatarInContract

		const avatarDetails = await this.userAvatarModel.findOne({ userId })

		if (avatarDetails) {
			return {
				avatarUrl: avatarDetails.url,
			}
		}

		return {
			avatarUrl: null,
		}
	}

	async deleteUserAvatar(deleteUserAvatarInContract: FileMS_DeleteUserAvatarInContract) {
		const { userId } = deleteUserAvatarInContract

		const existingAvatarInDb = await this.userAvatarModel.findOne({ userId })

		if (existingAvatarInDb) {
			await this.commonService.deleteFile(existingAvatarInDb.url)

			// Remove user avatar details in DB
			await this.userAvatarModel.deleteOne({ userId })
		}
	}
}
