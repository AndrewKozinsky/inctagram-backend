import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { EmailAdapterService } from '@app/email-adapter'
import { CreateUserCommand } from './CreateUser.command'
import { UserRepository } from '../../repositories/user.repository'
import { ErrorMessage } from '../../infrastructure/exceptionFilters/layerResult'
import { UserQueryRepository } from '../../repositories/user.queryRepository'
import { ApiProperty } from '@nestjs/swagger'

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
	constructor(
		private userRepository: UserRepository,
		private userQueryRepository: UserQueryRepository,
		private emailAdapter: EmailAdapterService,
	) {}

	async execute(command: CreateUserCommand) {
		const { createUserDto } = command

		const existingUser = await this.userRepository.getUserByEmailOrName({
			email: createUserDto.email,
			name: createUserDto.name,
		})

		if (existingUser) {
			if (existingUser.isEmailConfirmed) {
				throw new Error(ErrorMessage.EmailOrUsernameIsAlreadyRegistered)
			}

			await this.userRepository.deleteUser(existingUser.id)
		}

		const createdUser = await this.userRepository.createUser(createUserDto)

		this.emailAdapter.sendEmailConfirmationMessage(
			createdUser.email,
			createdUser.emailConfirmationCode!,
		)

		return await this.userQueryRepository.getUserById(createdUser.id)
	}
}

export class ViewUserDTO {
	@ApiProperty()
	name: string
}
