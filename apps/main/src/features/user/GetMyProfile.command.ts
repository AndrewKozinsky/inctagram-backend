import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserQueryRepository } from '../../repositories/user.queryRepository'

export class GetMyProfileCommand {
	constructor(public userId: number) {}
}

@CommandHandler(GetMyProfileCommand)
export class GetMyProfileHandler implements ICommandHandler<GetMyProfileCommand> {
	constructor(private userQueryRepository: UserQueryRepository) {}

	async execute(command: GetMyProfileCommand) {
		const { userId } = command

		const user = await this.userQueryRepository.getUserById(userId)
		return user!
	}
}
