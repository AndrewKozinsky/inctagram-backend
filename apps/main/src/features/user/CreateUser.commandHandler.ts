import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { EmailAdapterService } from '@app/email-adapter'
import { CreateUserCommand } from './CreateUser.command'
import { UserRepository } from '../../repositories/user.repository'
import { ErrorMessage } from '../../../../../libs/layerResult'

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
	constructor(
		private userRepository: UserRepository,
		private emailAdapter: EmailAdapterService,
	) {}

	async execute(command: CreateUserCommand) {
		const { createUserDto } = command

		if (await this.userRepository.getUserByEmail(createUserDto.email)) {
			throw new Error(ErrorMessage.EmailOrUsernameIsAlreadyRegistered)
		}

		const createdUser = await this.userRepository.createUser(createUserDto)

		this.emailAdapter.sendEmailConfirmationMessage(
			createdUser.email,
			createdUser.emailConfirmationCode!,
		)
	}
}
