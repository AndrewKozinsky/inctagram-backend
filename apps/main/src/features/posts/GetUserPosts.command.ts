import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { lastValueFrom } from 'rxjs'
import { Inject } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { ErrorMessage, FileMS_EventNames } from '@app/shared'
import { PostRepository } from '../../repositories/post.repository'
import { CreatePostDtoModel } from '../../models/post/post.input.model'
import { FileMS_SavePostImagesInContract } from '@app/shared/contracts/fileMS.contracts'
import { PostQueryRepository } from '../../repositories/post.queryRepository'
import { PostPhotoRepository } from '../../repositories/postPhoto.repository'

export class GetUserPostsCommand {
	constructor(public userId: number) {}
}

@CommandHandler(GetUserPostsCommand)
export class GetUserPostsHandler implements ICommandHandler<GetUserPostsCommand> {
	constructor(private postQueryRepository: PostQueryRepository) {}

	async execute(command: GetUserPostsCommand) {
		const { userId } = command

		return await this.postQueryRepository.getUserPosts(userId)
	}
}
