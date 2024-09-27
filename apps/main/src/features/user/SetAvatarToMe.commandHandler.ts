import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

export class SetAvatarToMeCommand {
	constructor(public readonly avatarFile: Express.Multer.File) {}
}

@CommandHandler(SetAvatarToMeCommand)
export class SetAvatarToMeHandler implements ICommandHandler<SetAvatarToMeCommand> {
	async execute(command: SetAvatarToMeCommand) {
		const { avatarFile } = command

		const fileBuffer = avatarFile.buffer

		return {
			avatarUrl: 'avatarUrl',
		}
	}
}
