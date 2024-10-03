import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { lastValueFrom } from 'rxjs'
import { Inject } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import {
	FileEventNames,
	SaveFileInContract,
	SaveUserAvatarInContract,
} from '../../../../files/src/contracts/contracts'
import { UserRepository } from '../../repositories/user.repository'

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

		let avatarUrl: null | string = null

		// Save file
		try {
			const sendingDataContract: SaveUserAvatarInContract = { userId, avatarFile }
			avatarUrl = await lastValueFrom(
				this.filesMicroClient.send(FileEventNames.SaveUserAvatar, sendingDataContract),
			)

			// Set avatar image src to user table in DB
			await this.userRepository.updateUser(userId, {
				avatar: avatarUrl,
			})
		} catch (err: any) {}

		return {
			avatarUrl,
		}
	}
}
