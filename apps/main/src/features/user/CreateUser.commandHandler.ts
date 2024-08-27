import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CreateUserCommand } from './CreateUser.command'
import { UserRepository } from '../../repositories/user.repository'
import { LayerErrorCode } from '../../../../../libs/layerResult'
import { EmailAdapterService } from '@app/email-adapter'

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
	constructor(
		private userRepository: UserRepository,
		private emailAdapter: EmailAdapterService,
	) {}

	async execute(command: CreateUserCommand) {
		const { createUserDto } = command

		if (await this.userRepository.getUserByEmail(createUserDto.email)) {
			throw new Error(LayerErrorCode.BadRequest_400)
		}

		const createdUser = await this.userRepository.createUser(createUserDto)

		try {
			await this.emailAdapter.sendEmailConfirmationMessage(
				createdUser.email,
				createdUser.emailConfirmationCode!,
			)
		} catch (err: unknown) {
			console.log(err)
		}
	}
}
