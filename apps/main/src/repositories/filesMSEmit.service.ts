import { Inject, Injectable } from '@nestjs/common'
import {
	FileMS_EventNames,
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

	/*async getPostPhotos(postId: number): Promise<FileMS_GetPostImagesOutContract> {
		const sendingDataContract: FileMS_GetPostImagesInContract = { postId }
		return lastValueFrom(
			this.filesMicroClient.send(FileMS_EventNames.GetPostImages, sendingDataContract),
		)
	}*/

	/*async deletePostPhotos(postId: number): Promise<FileMS_DeletePostImagesOutContract> {
		const sendingDataContract: FileMS_DeletePostImagesInContract = { postId }
		return lastValueFrom(
			this.filesMicroClient.send(FileMS_EventNames.DeletePostImages, sendingDataContract),
		)
	}*/
}
