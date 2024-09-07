import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../repositories/user.repository'
import { ErrorMessage } from '../../infrastructure/exceptionFilters/layerResult'
import { CreateRefreshTokenCommand } from './CreateRefreshToken.commandHandler'
import { LoginDtoModel } from '../../models/auth/auth.input.model'
import { UserQueryRepository } from '../../repositories/user.queryRepository'

export class LoginCommand {
	constructor(
		public readonly loginUserDto: LoginDtoModel,
		public readonly clientIP: string,
		public readonly clientName: string,
	) {}
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
	constructor(
		private readonly commandBus: CommandBus,
		private userRepository: UserRepository,
		private userQueryRepository: UserQueryRepository,
	) {}

	async execute(command: LoginCommand) {
		const { loginUserDto, clientIP, clientName } = command

		const user = await this.userRepository.getUserByEmailAndPassword(
			loginUserDto.email,
			loginUserDto.password,
		)

		if (!user) {
			throw new Error(ErrorMessage.EmailOrPasswordDoNotMatch)
		}

		if (!user.isEmailConfirmed) {
			throw new Error(ErrorMessage.EmailIsNotConfirmed)
		}

		const refreshTokenStr = await this.commandBus.execute(
			new CreateRefreshTokenCommand(user.id, clientIP, clientName),
		)

		const outUser = await this.userQueryRepository.getUserById(user.id)

		return {
			refreshTokenStr,
			user: outUser!,
		}
	}
}
