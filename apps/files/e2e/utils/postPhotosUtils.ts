import {
	FileMS_DeleteUserAvatarInContract,
	FileMS_EventNames,
	FileMS_GetUserAvatarInContract,
	FileMS_SavePostImagesInContract,
	FileMS_SaveUserAvatarInContract,
} from '@app/shared'
import { ClientProxy } from '@nestjs/microservices'
import path from 'path'
import { readFileAsMulterFile } from './readFileAsMulterFile'

export const postPhotosUtils = {
	async createPostPhotos(emitApp: ClientProxy, postId: number) {
		const avatarFilePaths = [
			path.join(__dirname, '../utils/files/post-photo-1.jpg'),
			path.join(__dirname, '../utils/files/post-photo-2.png'),
		]

		const postImages = await Promise.all(
			avatarFilePaths.map((filePath) => readFileAsMulterFile(filePath)),
		)

		// Prepare a payload for the microservice
		const eventName = FileMS_EventNames.SavePostImages
		const payload: FileMS_SavePostImagesInContract = {
			postId,
			photoFiles: postImages,
		}

		// Send a request to the microservice
		return await emitApp.send(eventName, payload).toPromise()
	},
	/*async getUserAvatar(emitApp: ClientProxy, userId: number) {
		// Prepare a payload for the microservice
		const eventName = FileMS_EventNames.GetUserAvatar
		const payload: FileMS_GetUserAvatarInContract = {
			userId,
		}

		// Send a request to the microservice
		return await emitApp.send(eventName, payload).toPromise()
	},*/
	/*async deleteUserAvatar(emitApp: ClientProxy, userId: number) {
		// Prepare a payload for the microservice
		const eventName = FileMS_EventNames.DeleteUserAvatar
		const payload: FileMS_DeleteUserAvatarInContract = {
			userId,
		}

		// Send a request to the microservice
		return await emitApp.send(eventName, payload).toPromise()
	},*/
}
