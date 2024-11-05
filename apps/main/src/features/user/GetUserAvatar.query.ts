import { CommandHandler, ICommandHandler, IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { MainConfigService } from '@app/config'
import { UserRepository } from '../../repositories/user.repository'
import { ErrorMessage } from '@app/shared'
import { GetUsersQuery } from './GetUsers.query'

export class GetUserAvatarQuery {
	constructor(public userId: number) {}
}

@QueryHandler(GetUserAvatarQuery)
export class GetUserAvatarHandler implements IQueryHandler<GetUserAvatarQuery> {
	constructor(private userRepository: UserRepository) {}

	async execute(command: GetUserAvatarQuery) {
		const { userId } = command

		// Set avatar image src to user table in DB
		const user = await this.userRepository.getUserById(userId)
		if (!user) {
			throw new Error(ErrorMessage.UserNotFound)
		}

		return {
			avatarUrl: user.avatar,
		}
	}
}
