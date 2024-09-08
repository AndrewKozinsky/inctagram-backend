import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../repositories/user.repository'
import { JwtAdapterService } from '@app/jwt-adapter'
import { SecurityRepository } from '../../repositories/security.repository'

export class TerminateAllDeviceRefreshTokensApartThisCommand {
	constructor(public readonly refreshTokenStr: string) {}
}

@CommandHandler(TerminateAllDeviceRefreshTokensApartThisCommand)
export class TerminateAllDeviceRefreshTokensApartThisHandler
	implements ICommandHandler<TerminateAllDeviceRefreshTokensApartThisCommand>
{
	constructor(
		private userRepository: UserRepository,
		private securityRepository: SecurityRepository,
		private jwtAdapter: JwtAdapterService,
	) {}

	async execute(command: TerminateAllDeviceRefreshTokensApartThisCommand) {
		const { refreshTokenStr } = command

		const refreshToken = this.jwtAdapter.getRefreshTokenDataFromTokenStr(refreshTokenStr)
		const { deviceId } = refreshToken!

		await this.securityRepository.terminateAllDeviceRefreshTokensApartThis(deviceId)
	}
}
