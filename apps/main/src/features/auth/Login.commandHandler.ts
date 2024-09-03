import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../repositories/user.repository'
import { ErrorMessage } from '../../../../../libs/layerResult'
import { LoginCommand } from './Login.command'
import { JwtAdapterService } from '@app/jwt-adapter'
import { AuthRepository } from '../../repositories/auth.repository'

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
	constructor(
		private userRepository: UserRepository,
		private authRepository: AuthRepository,
		private jwtAdapter: JwtAdapterService,
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

		const newDeviceRefreshToken = this.jwtAdapter.createDeviceRefreshToken(
			user.id,
			clientIP,
			clientName,
		)

		await this.authRepository.insertDeviceRefreshToken(newDeviceRefreshToken)

		const refreshTokenStr = this.jwtAdapter.createRefreshTokenStr(
			newDeviceRefreshToken.deviceId,
		)

		return {
			refreshTokenStr,
			user,
		}
	}
}
