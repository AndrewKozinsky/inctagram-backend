import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { EmailAdapterService } from '@app/email-adapter'
import { CreateUserCommand } from './CreateUser.command'
import { UserRepository } from '../../repositories/user.repository'
import { LayerErrorCode } from '../../../../../libs/layerResult'
import { MyError } from '../../utils/misc'

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
	constructor(
		private userRepository: UserRepository,
		private emailAdapter: EmailAdapterService,
	) {}

	async execute(command: CreateUserCommand) {
		const { createUserDto } = command

		if (await this.userRepository.getUserByEmail(createUserDto.email)) {
			throw MyError(LayerErrorCode.BadRequest_400)
		}

		const createdUser = await this.userRepository.createUser(createUserDto)

		this.emailAdapter.sendEmailConfirmationMessage(
			createdUser.email,
			createdUser.emailConfirmationCode!,
		)
	}
}
