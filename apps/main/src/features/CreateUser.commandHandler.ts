import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CreateUserCommand } from './CreateUser.command'

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
	async execute(command: CreateUserCommand) {
		const { dto } = command
		return 'Dragon has been killed'
	}
}
