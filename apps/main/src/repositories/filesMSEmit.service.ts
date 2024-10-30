import { Inject, Injectable } from '@nestjs/common'
import {
	FileMS_DeletePostPhotoInContract,
	FileMS_DeletePostPhotoOutContract,
	FileMS_EventNames,
	FileMS_GetPostPhotosInContract,
	FileMS_GetPostPhotosOutContract,
	FileMS_GetUsersAvatarsInContract,
	FileMS_GetUsersAvatarsOutContract,
} from '@app/shared'
import { lastValueFrom } from 'rxjs'
import { ClientProxy } from '@nestjs/microservices'

@Injectable()
export class FilesMSEmitService {
	constructor(@Inject('FILES_MICROSERVICE') private filesMicroClient: ClientProxy) {}

	/*async getUsersAvatars(usersIds: number[]): Promise<FileMS_GetUsersAvatarsOutContract> {
		const sendingDataContract: FileMS_GetUsersAvatarsInContract = { usersIds }
		return lastValueFrom(
			this.filesMicroClient.send(FileMS_EventNames.GetUsersAvatars, sendingDataContract),
		)
	}*/

	/*async getPostsPhotos(postsIds: number[]): Promise<FileMS_GetPostsImagesOutContract> {
		const sendingDataContract: FileMS_GetPostsImagesInContract = { postsIds }
		return lastValueFrom(
			this.filesMicroClient.send(FileMS_EventNames.GetPostsImages, sendingDataContract),
		)
	}*/

	async getPostPhotos(photosIds: string[]): Promise<FileMS_GetPostPhotosOutContract> {
		const sendingDataContract: FileMS_GetPostPhotosInContract = { photosIds }
		return lastValueFrom(
			this.filesMicroClient.send(FileMS_EventNames.GetPostPhotos, sendingDataContract),
		)
	}

	async deletePostPhoto(photoId: string): Promise<FileMS_DeletePostPhotoOutContract> {
		const sendingDataContract: FileMS_DeletePostPhotoInContract = { photoId }
		return lastValueFrom(
			this.filesMicroClient.send(FileMS_EventNames.DeletePostPhoto, sendingDataContract),
		)
	}
}
