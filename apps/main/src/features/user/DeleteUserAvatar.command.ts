import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ErrorMessage, FileMS_EventNames } from '@app/shared'
import { lastValueFrom } from 'rxjs'
import { Inject } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { FileMS_DeleteFileInContract } from '@app/shared/contracts/fileMS.contracts'
import { UserRepository } from '../../repositories/user.repository'

export class DeleteUserAvatarCommand {
	constructor(public userId: number) {}
}

@CommandHandler(DeleteUserAvatarCommand)
export class DeleteUserAvatarHandler implements ICommandHandler<DeleteUserAvatarCommand> {
	constructor(
		@Inject('FILES_MICROSERVICE') private filesMicroClient: ClientProxy,
		private userRepository: UserRepository,
	) {}

	async execute(command: DeleteUserAvatarCommand) {
		const { userId } = command

		// Set avatar image src to user table in DB
		const user = await this.userRepository.getUserById(userId)
		if (!user) {
			throw new Error(ErrorMessage.UserNotFound)
		}

		// Delete avatar file
		const sendingDataContract: FileMS_DeleteFileInContract = {
			userId: user.id,
		}
		await lastValueFrom(
			this.filesMicroClient.send(FileMS_EventNames.DeleteUserAvatar, sendingDataContract),
		)

		await this.userRepository.updateUser(userId, { files_ms_avatar_id: null })
	}
}
