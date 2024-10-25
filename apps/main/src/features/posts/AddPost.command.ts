import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { lastValueFrom } from 'rxjs'
import { Inject } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { ErrorMessage, FileMS_EventNames } from '@app/shared'
import { PostRepository } from '../../repositories/post.repository'
import { CreatePostDtoModel } from '../../models/post/post.input.model'
import { FileMS_SavePostImagesInContract } from '@app/shared/contracts/fileMS.contracts'
import { PostQueryRepository } from '../../repositories/post.queryRepository'

export class AddPostCommand {
	constructor(
		public userId: number,
		public dto: CreatePostDtoModel,
		public photoFiles: Express.Multer.File[],
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
		const { userId, dto, photoFiles } = command

		// Create a post
		const createdPost = await this.postRepository.createPost(userId, dto)

		// Save photos files
		try {
			const sendingDataContract: FileMS_SavePostImagesInContract = {
				postId: createdPost.id,
				photoFiles,
			}

			await lastValueFrom(
				this.filesMicroClient.send(FileMS_EventNames.SavePostImages, sendingDataContract),
			)
		} catch (err: any) {
			console.log(err)
			throw new Error(ErrorMessage.CannotSaveFiles)
		}

		const post = await this.postQueryRepository.getPostById(createdPost.id)
		return post!
	}
}
