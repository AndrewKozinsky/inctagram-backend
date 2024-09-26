import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'

export class SetAvatarToMeCommand {
	constructor(public readonly avatarFile: Express.Multer.File) {}
}

@CommandHandler(SetAvatarToMeCommand)
export class SetAvatarToMeHandler implements ICommandHandler<SetAvatarToMeCommand> {
	async execute(command: SetAvatarToMeCommand) {
		// console.log(command)
		// const { avatarFile } = command

		// console.log(avatarFile)

		return {
			avatarUrl: 'avatarUrl',
		}
	}
}
