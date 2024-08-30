import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ErrorCode } from '../../../../../libs/layerResult'
import { JwtAdapterService } from '@app/jwt-adapter'
import { AuthRepository } from '../../repositories/auth.repository'
import { LogoutCommand } from './Logout.command'
import { MyError } from '../../utils/misc'

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
	constructor(
		private authRepository: AuthRepository,
		private jwtAdapter: JwtAdapterService,
	) {}

	async execute(command: LogoutCommand) {
		const { refreshToken } = command

		const refreshTokenInDb =
			await this.authRepository.getDeviceRefreshTokenByTokenStr(refreshToken)

		if (!refreshTokenInDb || !this.jwtAdapter.isRefreshTokenStrValid(refreshToken)) {
			throw MyError(ErrorCode.Unauthorized_401)
		}

		await this.authRepository.deleteDeviceRefreshTokenByDeviceId(refreshTokenInDb.deviceId)

		return null
	}
}
