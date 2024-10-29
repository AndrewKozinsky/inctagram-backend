// import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
// import { ErrorMessage, FileMS_DeletePostImagesInContract, FileMS_EventNames } from '@app/shared'
// import { lastValueFrom } from 'rxjs'
// import { Inject } from '@nestjs/common'
// import { ClientProxy } from '@nestjs/microservices'
// import { PostRepository } from '../../repositories/post.repository'

/*export class DeletePostCommand {
	constructor(
		public postId: number,
		public userId: number,
	) {}
}*/

/*@CommandHandler(DeletePostCommand)
export class DeletePostHandler implements ICommandHandler<DeletePostCommand> {
	constructor(
		@Inject('FILES_MICROSERVICE') private filesMicroClient: ClientProxy,
		private postRepository: PostRepository,
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

		const sendingDataContract: FileMS_DeletePostImagesInContract = {
			postId: thisPost.id,
		}
		await lastValueFrom(
			this.filesMicroClient.send(FileMS_EventNames.DeletePostImages, sendingDataContract),
		)

		await this.postRepository.deletePost(postId)
	}
}*/
