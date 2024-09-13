import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { EmailAdapterService } from '@app/email-adapter'
import { UserRepository } from '../../repositories/user.repository'
import { ErrorMessage } from '../../infrastructure/exceptionFilters/layerResult'
import { UserQueryRepository } from '../../repositories/user.queryRepository'
import { CreateUserDtoModel } from '../../models/user/user.input.model'
import { UserOutModel } from '../../models/user/user.out.model'

export class CreateUserCommand {
	constructor(public readonly createUserDto: CreateUserDtoModel) {}
}

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

		/// !!!!!!!!!!!!!!!!!
		const createdUser = await this.userRepository.createUser(createUserDto)

		/*try {
			console.log(6)
			await this.emailAdapter.sendEmailConfirmationMessage(
				createdUser.email,
				createdUser.emailConfirmationCode!,
			)
		} catch (err) {
			console.log(err)
			console.log(err)
		}
		console.log(7)
		return (await this.userQueryRepository.getUserById(createdUser.id)) as UserOutModel*/
		//---
		return { id: 1, email: 'string', name: 'string' }
	}
}
