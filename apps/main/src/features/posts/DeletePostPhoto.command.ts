import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { lastValueFrom } from 'rxjs'
import { Inject } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import {
	ErrorMessage,
	FileMS_DeletePostPhotoInContract,
	FileMS_EventNames,
	FileMS_SavePostPhotoInContract,
} from '@app/shared'
import { PostRepository } from '../../repositories/post.repository'

export class DeletePostPhotoCommand {
	constructor(public photoId: string) {}
}

@CommandHandler(DeletePostPhotoCommand)
export class DeletePostPhotoHandler implements ICommandHandler<DeletePostPhotoCommand> {
	constructor(
		@Inject('FILES_MICROSERVICE') private filesMicroClient: ClientProxy,
		private postRepository: PostRepository,
	) {}

	async execute(command: DeletePostPhotoCommand) {
		const { photoId } = command

		// Delete post photo id from main gateway
		await this.postRepository.deletePostPhoto(photoId)
	}
}
