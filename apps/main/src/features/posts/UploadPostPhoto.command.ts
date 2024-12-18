import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { lastValueFrom } from 'rxjs'
import { Inject } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { ErrorMessage, FileMS_EventNames, FileMS_SavePostPhotoInContract } from '@app/shared'
import { PostRepository } from '../../repositories/post.repository'
import { PostPhotoRepository } from '../../repositories/postPhoto.repository'

export class UploadPostPhotoCommand {
	constructor(public postPhotoFile: Express.Multer.File) {}
}

@CommandHandler(UploadPostPhotoCommand)
export class UploadPostPhotoHandler implements ICommandHandler<UploadPostPhotoCommand> {
	constructor(@Inject('FILES_MICROSERVICE') private filesMicroClient: ClientProxy) {}

	async execute(command: UploadPostPhotoCommand) {
		const { postPhotoFile } = command

		// Save post photo
		try {
			const sendingDataContract: FileMS_SavePostPhotoInContract = {
				postPhotoFile,
			}

			const createPhotoRes = await lastValueFrom(
				this.filesMicroClient.send(FileMS_EventNames.SavePostPhoto, sendingDataContract),
			)

			return createPhotoRes
		} catch (err: any) {
			console.log(err)
			throw new Error(ErrorMessage.CannotSaveFile)
		}
	}
}
