import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../repositories/user.repository'
import { LayerErrorCode } from '../../../../../libs/layerResult'
import { EmailAdapterService } from '@app/email-adapter'
import { LoginCommand } from './Login.command'
import { JwtAdapterService } from '@app/jwt-adapter'
import { AuthRepository } from '../../repositories/auth.repository'
import { LogoutCommand } from './Logout.command'
import { UnauthorizedException } from '@nestjs/common'
import { MainConfigService } from '@app/config'

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
			throw new Error(LayerErrorCode.Unauthorized_401)
		}

		await this.authRepository.deleteDeviceRefreshTokenByDeviceId(refreshTokenInDb.deviceId)

		return null
	}
}
