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

export class GetPostCommand {
	constructor(public postId: number) {}
}

@CommandHandler(GetPostCommand)
export class GetPostHandler implements ICommandHandler<GetPostCommand> {
	constructor(private postQueryRepository: PostQueryRepository) {}

	async execute(command: GetPostCommand) {
		const { postId } = command

		return await this.postQueryRepository.getPostById(postId)
	}
}
