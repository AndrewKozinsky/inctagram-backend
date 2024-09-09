import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../repositories/user.repository'
import { ErrorMessage } from '../../infrastructure/exceptionFilters/layerResult'
import { JwtAdapterService } from '@app/jwt-adapter'
import { DeviceTokenOutModel } from '../../models/auth/auth.output.model'
import { SecurityRepository } from '../../repositories/security.repository'

export class GenerateAccessAndRefreshTokensCommand {
	constructor(public readonly deviceRefreshToken: DeviceTokenOutModel) {}
}

@CommandHandler(GenerateAccessAndRefreshTokensCommand)
export class GenerateAccessAndRefreshTokensHandler
	implements ICommandHandler<GenerateAccessAndRefreshTokensCommand>
{
	constructor(
		private userRepository: UserRepository,
		private securityRepository: SecurityRepository,
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

		await this.securityRepository.updateDeviceRefreshTokenDate(deviceRefreshToken.deviceId)

		const newRefreshTokenStr = this.jwtAdapter.createRefreshTokenStr(
			deviceRefreshToken.deviceId,
		)

		return {
			newAccessToken: this.jwtAdapter.createAccessTokenStr(deviceRefreshToken.userId),
			newRefreshTokenStr,
		}
	}
}
