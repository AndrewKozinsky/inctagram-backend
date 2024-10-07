import { Injectable } from '@nestjs/common'
import { DeviceToken } from '@prisma/client'
import { PrismaService } from '../db/prisma.service'
import {
	GetUserDevicesOutModel,
	UserDeviceOutModel,
} from '../models/security/security.output.model'
import { UserRepository } from './user.repository'

@Injectable()
export class DevicesQueryRepository {
	constructor(
		private prisma: PrismaService,
		private userRepository: UserRepository,
	) {}

	async getUserDevices(refreshToken: string): Promise<GetUserDevicesOutModel> {
		const user = await this.userRepository.getUserByRefreshToken(refreshToken)
		if (!user) return []

		const userDevices = await this.prisma.deviceToken.findMany({
			where: { user_id: user.id },
		})

		return userDevices.map(this.mapDbUserDeviceToOutputUserDevice)
	}

	mapDbUserDeviceToOutputUserDevice(DbUserRefreshToken: DeviceToken): UserDeviceOutModel {
		return {
			ip: DbUserRefreshToken.device_ip, // IP address of device
			title: DbUserRefreshToken.device_name, // Chrome 105
			lastActiveDate: new Date(DbUserRefreshToken.issued_at).toISOString(), // Date of the last generating of refresh/access tokens
			deviceId: DbUserRefreshToken.device_id.toString(), // Id of the connected device session
		}
	}
}
