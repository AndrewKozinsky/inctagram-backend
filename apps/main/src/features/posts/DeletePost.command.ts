import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ErrorMessage } from '@app/shared'
import { PostRepository } from '../../repositories/post.repository'
import { PostPhotoRepository } from '../../repositories/postPhoto.repository'

export class DeletePostCommand {
	constructor(
		public postId: number,
		public userId: number,
	) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostHandler implements ICommandHandler<DeletePostCommand> {
	constructor(
		private postRepository: PostRepository,
		private postPhotoRepository: PostPhotoRepository,
	) {}

	async execute(command: DeletePostCommand) {
		const { postId, userId } = command

		const postWithId = await this.postRepository.getPostById(postId)

		if (!postWithId) {
			throw new Error(ErrorMessage.PostNotFound)
		}
		if (postWithId.userId !== userId) {
			throw new Error(ErrorMessage.PostNotBelongToUser)
		}

		await this.postRepository.deletePost(postId)
		await this.postPhotoRepository.deletePostPhotos(postWithId.id)
	}
}
