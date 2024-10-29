// import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
// import { ErrorMessage } from '@app/shared'
// import { PostRepository } from '../../repositories/post.repository'
// import { UpdatePostDtoModel } from '../../models/post/post.input.model'
// import { PostQueryRepository } from '../../repositories/post.queryRepository'

/*export class UpdatePostCommand {
	constructor(
		public postId: number,
		public userId: number,
		public dto: UpdatePostDtoModel,
	) {}
}*/

/*@CommandHandler(UpdatePostCommand)
export class UpdatePostHandler implements ICommandHandler<UpdatePostCommand> {
	constructor(
		private postQueryRepository: PostQueryRepository,
		private postRepository: PostRepository,
	) {}

	async execute(command: UpdatePostCommand) {
		const { postId, userId, dto } = command

		const postWithId = await this.postRepository.getPostById(postId)

		if (!postWithId) {
			throw new Error(ErrorMessage.PostNotFound)
		}
		if (postWithId.userId !== userId) {
			throw new Error(ErrorMessage.PostNotBelongToUser)
		}

		await this.postRepository.updatePost(postId, dto)

		const updatedPost = await this.postQueryRepository.getPostById(postId)
		return updatedPost!
	}
}*/
