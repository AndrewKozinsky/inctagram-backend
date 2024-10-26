import {
	FileMS_DeletePostImagesInContract,
	FileMS_DeleteUserAvatarInContract,
	FileMS_EventNames,
	FileMS_GetPostImagesInContract,
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
	async getPostPhotos(emitApp: ClientProxy, postId: number) {
		// Prepare a payload for the microservice
		const eventName = FileMS_EventNames.GetPostImages
		const payload: FileMS_GetPostImagesInContract = {
			postId,
		}

		// Send a request to the microservice
		return await emitApp.send(eventName, payload).toPromise()
	},
	async deletePostPhotos(emitApp: ClientProxy, postId: number) {
		// Prepare a payload for the microservice
		const eventName = FileMS_EventNames.DeletePostImages
		const payload: FileMS_DeletePostImagesInContract = {
			postId,
		}

		// Send a request to the microservice
		return await emitApp.send(eventName, payload).toPromise()
	},
}
