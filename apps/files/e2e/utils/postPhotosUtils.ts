import {
	FileMS_DeletePostPhotoInContract,
	FileMS_DeletePostPhotoOutContract,
	FileMS_EventNames,
	FileMS_GetPostPhotosInContract,
	FileMS_SavePostPhotoInContract,
	FileMS_SavePostPhotoOutContract,
} from '@app/shared'
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
	async createPostPhoto(
		emitApp: ClientProxy,
		imageUrl?: string,
	): Promise<FileMS_SavePostPhotoOutContract> {
		const postPhotoPath = imageUrl
			? imageUrl
			: path.join(__dirname, '../utils/files/post-photo-1.jpg')

		const postPhotoFile = await readFileAsMulterFile(postPhotoPath)

		// Prepare a payload for the microservice
		const eventName = FileMS_EventNames.SavePostPhoto
		const payload: FileMS_SavePostPhotoInContract = {
			postPhotoFile,
		}

		// Send a request to the microservice
		return await emitApp.send(eventName, payload).toPromise()
	},
	/*async getPostsPhotos(emitApp: ClientProxy, postsIds: number[]) {
		// Prepare a payload for the microservice
		const eventName = FileMS_EventNames.GetPostsImages
		const payload: FileMS_GetPostsImagesInContract = {
			postsIds,
		}

		// Send a request to the microservice
		return await emitApp.send(eventName, payload).toPromise()
	},*/
	async getPostPhotos(emitApp: ClientProxy, photosIds: string[]) {
		// Prepare a payload for the microservice
		const eventName = FileMS_EventNames.GetPostPhotos
		const payload: FileMS_GetPostPhotosInContract = {
			photosIds,
		}

		// Send a request to the microservice
		return await emitApp.send(eventName, payload).toPromise()
	},
	async deletePostPhoto(
		emitApp: ClientProxy,
		photoId: string,
	): Promise<FileMS_DeletePostPhotoOutContract> {
		// Prepare a payload for the microservice
		const eventName = FileMS_EventNames.DeletePostPhoto
		const payload: FileMS_DeletePostPhotoInContract = {
			photoId,
		}

		// Send a request to the microservice
		return await emitApp.send(eventName, payload).toPromise()
	},
}
