import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../repositories/user.repository'
import { ErrorMessage } from '../../infrastructure/exceptionFilters/layerResult'
import { ConfirmEmailCommand } from './ConfirmEmail.command'
import { GenerateAccessAndRefreshTokensCommand } from './GenerateAccessAndRefreshTokens.command'
import { AuthRepository } from '../../repositories/auth.repository'
import { JwtAdapterService } from '@app/jwt-adapter'

@CommandHandler(GenerateAccessAndRefreshTokensCommand)
export class GenerateAccessAndRefreshTokensHandler
	implements ICommandHandler<GenerateAccessAndRefreshTokensCommand>
{
	constructor(
		private userRepository: UserRepository,
		private authRepository: AuthRepository,
		private jwtAdapter: JwtAdapterService,
	) {}

	async execute(command: GenerateAccessAndRefreshTokensCommand) {
		const { deviceRefreshToken } = command

		if (!deviceRefreshToken) {
			throw new Error(ErrorMessage.RefreshTokenIsNotValid)
		}

		// Throw en error if the user was removed
		const user = await this.userRepository.getUserById(deviceRefreshToken.userId)
		if (!user) {
			throw new Error(ErrorMessage.UserNotFound)
		}

		await this.authRepository.updateDeviceRefreshTokenDate(deviceRefreshToken.deviceId)

		const newRefreshToken = this.jwtAdapter.createRefreshTokenStr(deviceRefreshToken.deviceId)

		return {
			newAccessToken: this.jwtAdapter.createAccessTokenStr(deviceRefreshToken.userId),
			newRefreshToken,
		}
	}
}
