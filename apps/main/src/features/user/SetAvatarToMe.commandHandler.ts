import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { lastValueFrom } from 'rxjs'
import { Inject } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { FileEventNames, SaveFileInContract } from '../../../../files/src/contracts/contracts'

export class SetAvatarToMeCommand {
	constructor(
		public userId: number,
		public avatarFile: Express.Multer.File,
	) {}
}

@CommandHandler(SetAvatarToMeCommand)
export class SetAvatarToMeHandler implements ICommandHandler<SetAvatarToMeCommand> {
	constructor(@Inject('FILES_MICROSERVICE') private filesMicroClient: ClientProxy) {}

	async execute(command: SetAvatarToMeCommand) {
		const { userId, avatarFile } = command
		console.log(avatarFile)

		/*const fileExtension =
			avatarFile.originalname.split('.')[avatarFile.originalname.split('.').length - 1]
		const filePath = 'users/' + userId + '/avatar.' + fileExtension*/

		/*const setUserAvatarContract: SaveFileInContract = {
			mimetype: avatarFile.mimetype,
			filePath,
			fileBuffer: avatarFile.buffer,
		}

		const response = await lastValueFrom(
			this.filesMicroClient.send(FileEventNames.Save, setUserAvatarContract),
		)
		await this.filesMicroClient.close()*/

		return {
			// avatarUrl: filePath,
			avatarUrl: 'filePath',
		}
	}
}
