import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../repositories/user.repository'
import { ErrorMessage } from '@app/server-helper'

export class DeleteUserAvatarCommand {
	constructor(public userId: number) {}
}

@CommandHandler(DeleteUserAvatarCommand)
export class DeleteUserAvatarHandler implements ICommandHandler<DeleteUserAvatarCommand> {
	constructor(private userRepository: UserRepository) {}

	async execute(command: DeleteUserAvatarCommand) {
		const { userId } = command

		// Set avatar image src to user table in DB
		const user = await this.userRepository.getUserById(userId)
		if (!user) {
			throw new Error(ErrorMessage.UserNotFound)
		}

		await this.userRepository.updateUser(userId, { avatar: null })
	}
}
