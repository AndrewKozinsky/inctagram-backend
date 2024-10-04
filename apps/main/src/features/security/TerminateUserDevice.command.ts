import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { JwtAdapterService } from '@app/jwt-adapter'
import { DevicesRepository } from '../../repositories/devices.repository'
import { ErrorMessage } from '@app/server-helper'

export class TerminateUserDeviceCommand {
	constructor(
		public readonly currentDeviceTokenStr: string,
		public readonly deletionDeviceId: string,
	) {}
}

@CommandHandler(TerminateUserDeviceCommand)
export class TerminateUserDeviceHandler implements ICommandHandler<TerminateUserDeviceCommand> {
	constructor(
		private securityRepository: DevicesRepository,
		private jwtAdapter: JwtAdapterService,
	) {}

	async execute(command: TerminateUserDeviceCommand) {
		const { currentDeviceTokenStr, deletionDeviceId } = command

		// Is device for deletion is not exist give NotFound code
		const deviceRefreshToken =
			await this.securityRepository.getDeviceRefreshTokenByDeviceId(deletionDeviceId)

		if (!deviceRefreshToken) {
			throw new Error(ErrorMessage.RefreshTokenIsNotFound)
		}

		// Device for deletion exists. Check if current user belongs the device for deletion
		const currentUserDeviceId =
			this.jwtAdapter.getRefreshTokenDataFromTokenStr(currentDeviceTokenStr)?.deviceId

		if (!currentUserDeviceId) {
			throw new Error(ErrorMessage.UserDoesNotOwnThisDeviceToken)
		}
		const userDevices =
			await this.securityRepository.getUserDevicesByDeviceId(currentUserDeviceId)

		if (!userDevices || !userDevices.length) {
			throw new Error(ErrorMessage.UserDeviceNotFound)
		}

		const deletionDeviceInUserDevices = userDevices.find((userDevice) => {
			return userDevice.deviceId === deletionDeviceId
		})

		if (!deletionDeviceInUserDevices) {
			throw new Error(ErrorMessage.UserDeviceNotFound)
		}

		await this.securityRepository.deleteRefreshTokenByDeviceId(deletionDeviceId)
	}
}
