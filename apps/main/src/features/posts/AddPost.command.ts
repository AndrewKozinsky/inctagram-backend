import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { PostRepository } from '../../repositories/post.repository'
import { CreatePostDtoModel } from '../../models/post/post.input.model'
import { PostQueryRepository } from '../../repositories/post.queryRepository'

export class AddPostCommand {
	constructor(
		public userId: number,
		public dto: CreatePostDtoModel,
	) {}
}

@CommandHandler(AddPostCommand)
export class AddPostHandler implements ICommandHandler<AddPostCommand> {
	constructor(
		@Inject('FILES_MICROSERVICE') private filesMicroClient: ClientProxy,
		private postRepository: PostRepository,
		private postQueryRepository: PostQueryRepository,
	) {}

	async execute(command: AddPostCommand) {
		const { userId, dto } = command

		// Create a post
		const createdPost = await this.postRepository.createPost(userId, dto)

		const post = await this.postQueryRepository.getPostById(createdPost.id)
		return post!
	}
}
