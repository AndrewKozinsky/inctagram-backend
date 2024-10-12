import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserQueryRepository } from '../../repositories/user.queryRepository'

export class GetUsersCommand {
	constructor() {}
}

@CommandHandler(GetUsersCommand)
export class GetUsersHandler implements ICommandHandler<GetUsersCommand> {
	constructor(private userQueryRepository: UserQueryRepository) {}

	async execute(command: GetUsersCommand) {
		return this.userQueryRepository.getUsers()
	}
}
