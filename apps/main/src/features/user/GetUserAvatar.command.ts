import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { MainConfigService } from '@app/config'
import { UserRepository } from '../../repositories/user.repository'
import { ErrorMessage } from '@app/shared'

export class GetUserAvatarCommand {
	constructor(public userId: number) {}
}

@CommandHandler(GetUserAvatarCommand)
export class GetUserAvatarHandler implements ICommandHandler<GetUserAvatarCommand> {
	constructor(
		private userRepository: UserRepository,
		private mainConfig: MainConfigService,
	) {}

	async execute(command: GetUserAvatarCommand) {
		const { userId } = command

		// Set avatar image src to user table in DB
		const user = await this.userRepository.getUserById(userId)
		if (!user) {
			throw new Error(ErrorMessage.UserNotFound)
		}

		const avatarUrl = this.mainConfig.get().s3.filesRootUrl + '/' + user.avatar

		return {
			avatarUrl,
		}
	}
}
