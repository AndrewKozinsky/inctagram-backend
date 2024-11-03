import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ErrorMessage } from '@app/shared'
import { PostRepository } from '../../repositories/post.repository'

export class DeletePostCommand {
	constructor(
		public postId: number,
		public userId: number,
	) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostHandler implements ICommandHandler<DeletePostCommand> {
	constructor(private postRepository: PostRepository) {}

	async execute(command: DeletePostCommand) {
		const { postId, userId } = command

		const thisPost = await this.postRepository.getPostById(postId)

		if (!thisPost) {
			throw new Error(ErrorMessage.PostNotFound)
		}

		if (thisPost.userId !== userId) {
			throw new Error(ErrorMessage.PostNotBelongToUser)
		}

		await this.postRepository.deletePost(postId)
	}
}
