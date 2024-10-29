import { FileMS_EventNames } from '@app/shared'
import { ClientProxy } from '@nestjs/microservices'
import path from 'path'
import { readFileAsMulterFile } from './readFileAsMulterFile'

export const postPhotosUtils = {
	/*async createFivePostsPhotos(emitApp: ClientProxy) {
		for (let i = 1; i < 6; i++) {
			const imagesUrls: string[] = [path.join(__dirname, '../utils/files/post-photo-1.jpg')]

			if (i == 2) {
				const imagesUrls: string[] = [
					path.join(__dirname, '../utils/files/post-photo-2.png'),
				]
			} else {
				const imagesUrls: string[] = [
					path.join(__dirname, `../utils/files/post-photo-${i}.jpeg`),
				]
			}

			await postPhotosUtils.createPostPhotos(emitApp, i, imagesUrls)
		}
	},*/
	/*async createPostPhotos(emitApp: ClientProxy, postId: number, imagesUrls: string[] = []) {
		let avatarFilePaths = imagesUrls

		if (!avatarFilePaths.length) {
			avatarFilePaths = [
				path.join(__dirname, '../utils/files/post-photo-1.jpg'),
				path.join(__dirname, '../utils/files/post-photo-2.png'),
			]
		}

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
	},*/
	/*async getPostsPhotos(emitApp: ClientProxy, postsIds: number[]) {
		// Prepare a payload for the microservice
		const eventName = FileMS_EventNames.GetPostsImages
		const payload: FileMS_GetPostsImagesInContract = {
			postsIds,
		}

		// Send a request to the microservice
		return await emitApp.send(eventName, payload).toPromise()
	},*/
	/*async getPostPhotos(emitApp: ClientProxy, postId: number) {
		// Prepare a payload for the microservice
		const eventName = FileMS_EventNames.GetPostImages
		const payload: FileMS_GetPostImagesInContract = {
			postId,
		}

		// Send a request to the microservice
		return await emitApp.send(eventName, payload).toPromise()
	},*/
	/*async deletePostPhotos(emitApp: ClientProxy, postId: number) {
		// Prepare a payload for the microservice
		const eventName = FileMS_EventNames.DeletePostImages
		const payload: FileMS_DeletePostImagesInContract = {
			postId,
		}

		// Send a request to the microservice
		return await emitApp.send(eventName, payload).toPromise()
	},*/
}
