import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../repositories/user.repository'
import { LayerErrorCode } from '../../../../../libs/layerResult'
import { EmailAdapterService } from '@app/email-adapter'
import { LoginUserCommand } from './LoginUser.command'
import { JwtAdapterService } from '@app/jwt-adapter'
import { AuthRepository } from '../../repositories/auth.repository'

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
	constructor(
		private userRepository: UserRepository,
		private authRepository: AuthRepository,
		private jwtAdapter: JwtAdapterService,
	) {}

	async execute(command: LoginUserCommand) {
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

		/*const refreshTokenStr = this.jwtService.createRefreshTokenStr(
			newDeviceRefreshToken.deviceId,
		)*/

		/*return {
			refreshTokenStr,
			user: user.res.data,
		}*/
	}
}
