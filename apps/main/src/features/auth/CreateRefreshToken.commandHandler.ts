import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { JwtAdapterService } from '@app/jwt-adapter'
import { SecurityRepository } from '../../repositories/security.repository'

export class CreateRefreshTokenCommand {
	constructor(
		public userId: number,
		public clientIP: string,
		public clientName: string,
	) {}
}

@CommandHandler(CreateRefreshTokenCommand)
export class CreateRefreshTokenHandler implements ICommandHandler<CreateRefreshTokenCommand> {
	constructor(
		private jwtAdapter: JwtAdapterService,
		private securityRepository: SecurityRepository,
	) {}

	async execute(command: CreateRefreshTokenCommand) {
		const { userId, clientIP, clientName } = command

		const newDeviceRefreshToken = this.jwtAdapter.createDeviceRefreshToken(
			userId,
			clientIP,
			clientName,
		)

		await this.securityRepository.insertDeviceRefreshToken(newDeviceRefreshToken)

		const refreshTokenStr = this.jwtAdapter.createRefreshTokenStr(
			newDeviceRefreshToken.deviceId,
		)

		return refreshTokenStr
	}
}