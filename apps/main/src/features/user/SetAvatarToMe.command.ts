import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { lastValueFrom } from 'rxjs'
import { Inject } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { UserRepository } from '../../repositories/user.repository'
import {
	FileMS_EventNames,
	FileMS_SaveUserAvatarInContract,
	FileMS_SaveUserAvatarOutContract,
} from '@app/shared'

export class SetAvatarToMeCommand {
	constructor(
		public userId: number,
		public avatarFile: Express.Multer.File,
	) {}
}

@CommandHandler(SetAvatarToMeCommand)
export class SetAvatarToMeHandler implements ICommandHandler<SetAvatarToMeCommand> {
	constructor(
		@Inject('FILES_MICROSERVICE') private filesMicroClient: ClientProxy,
		private userRepository: UserRepository,
	) {}

	async execute(command: SetAvatarToMeCommand) {
		const { userId, avatarFile } = command

		// Save file
		const sendingDataContract: FileMS_SaveUserAvatarInContract = { userId, avatarFile }
		const filesMSRes: FileMS_SaveUserAvatarOutContract = await lastValueFrom(
			this.filesMicroClient.send(FileMS_EventNames.SaveUserAvatar, sendingDataContract),
		)

		// Set avatar image src to user table in DB
		await this.userRepository.updateUser(userId, {
			files_ms_avatar_id: filesMSRes.avatarId,
		})

		return {
			avatarUrl: filesMSRes.avatarUrl,
		}
	}
}
