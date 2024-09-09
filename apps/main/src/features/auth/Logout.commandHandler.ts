import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { JwtAdapterService } from '@app/jwt-adapter'
import { ErrorMessage } from '../../infrastructure/exceptionFilters/layerResult'
import { SecurityRepository } from '../../repositories/security.repository'

export class LogoutCommand {
	constructor(public readonly refreshToken: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
	constructor(
		private securityRepository: SecurityRepository,
		private jwtAdapter: JwtAdapterService,
	) {}

	async execute(command: LogoutCommand) {
		const { refreshToken } = command

		const refreshTokenInDb =
			await this.securityRepository.getDeviceRefreshTokenByTokenStr(refreshToken)

		if (!refreshTokenInDb || !this.jwtAdapter.isRefreshTokenStrValid(refreshToken)) {
			throw new Error(ErrorMessage.RefreshTokenIsNotValid)
		}

		await this.securityRepository.deleteRefreshTokenByDeviceId(refreshTokenInDb.deviceId)

		return null
	}
}
