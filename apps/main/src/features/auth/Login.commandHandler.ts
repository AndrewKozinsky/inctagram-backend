import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../repositories/user.repository'
import { LayerErrorCode } from '../../../../../libs/layerResult'
import { EmailAdapterService } from '@app/email-adapter'
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

		const user = await this.userRepository.getConfirmedUserByEmailAndPassword(loginUserDto)

		if (!user) {
			throw new Error(LayerErrorCode.BadRequest_400)
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
