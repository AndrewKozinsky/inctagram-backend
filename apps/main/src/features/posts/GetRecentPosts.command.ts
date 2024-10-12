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

export class GetRecentPostsCommand {
	constructor() {}
}

@CommandHandler(GetRecentPostsCommand)
export class GetRecentPostsHandler implements ICommandHandler<GetRecentPostsCommand> {
	constructor(private postQueryRepository: PostQueryRepository) {}

	async execute(command: GetRecentPostsCommand) {
		return await this.postQueryRepository.getRecentPosts()
	}
}
