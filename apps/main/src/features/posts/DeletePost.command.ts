import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ErrorMessage, FileMS_EventNames } from '@app/shared'
import { FileMS_DeleteFileInContract } from '@app/shared/contracts/fileMS.contracts'
import { lastValueFrom } from 'rxjs'
import { Inject } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { PostPhotoRepository } from '../../repositories/postPhoto.repository'
import { PostRepository } from '../../repositories/post.repository'

export class DeletePostCommand {
	constructor(
		public postId: number,
		public userId: number,
	) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostHandler implements ICommandHandler<DeletePostCommand> {
	constructor(
		@Inject('FILES_MICROSERVICE') private filesMicroClient: ClientProxy,
		private postRepository: PostRepository,
		private postPhotoRepository: PostPhotoRepository,
	) {}

	async execute(command: DeletePostCommand) {
		const { postId, userId } = command

		const thisPost = await this.postRepository.getPostById(postId)

		if (!thisPost) {
			throw new Error(ErrorMessage.PostNotFound)
		}

		if (thisPost.userId !== userId) {
			throw new Error(ErrorMessage.PostNotBelongToUser)
		}

		for (const photo of thisPost.photos) {
			const sendingDataContract: FileMS_DeleteFileInContract = {
				fileUrl: photo.url,
			}
			await lastValueFrom(
				this.filesMicroClient.send(FileMS_EventNames.DeleteFile, sendingDataContract),
			)
		}

		await this.postPhotoRepository.deletePostPhotos(thisPost.id)
		await this.postRepository.deletePost(postId)
	}
}
