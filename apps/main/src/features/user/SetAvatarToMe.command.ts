import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { lastValueFrom } from 'rxjs'
import { Inject } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { FileEventNames, SaveFileInContract } from '../../../../files/src/contracts/contracts'
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

		// Create avatar image dataset
		const fileExtension =
			avatarFile.originalname.split('.')[avatarFile.originalname.split('.').length - 1]
		const avatarUrl = 'users/' + userId + '/avatar.' + fileExtension

		const setUserAvatarContract: SaveFileInContract = {
			mimetype: avatarFile.mimetype,
			filePath: avatarUrl,
			fileBuffer: avatarFile.buffer,
			fileSize: avatarFile.size,
		}

		// Save file
		const response = await lastValueFrom(
			this.filesMicroClient.send(FileEventNames.Save, setUserAvatarContract),
		)
		await this.filesMicroClient.close()

		// Set avatar image src to user table in DB
		await this.userRepository.updateUser(userId, {
			avatar: avatarUrl,
		})

		return {
			avatarUrl,
		}
	}
}
