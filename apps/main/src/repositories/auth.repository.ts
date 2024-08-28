import { Injectable } from '@nestjs/common'
import { DeviceToken } from '@prisma/client'
import { PrismaService } from '../db/prisma.service'
import { DeviceTokenServiceModel } from '../models/auth/auth.service.model'

@Injectable()
export class AuthRepository {
	constructor(private prisma: PrismaService) {}

	async insertDeviceRefreshToken(
		deviceRefreshToken: DeviceTokenServiceModel,
	): Promise<DeviceTokenServiceModel> {
		const deviceToken = await this.prisma.deviceToken.create({
			data: {
				issuedAt: new Date(deviceRefreshToken.issuedAt).toISOString(),
				userId: deviceRefreshToken.userId,
				expirationDate: new Date(deviceRefreshToken.expirationDate).toISOString(),
				deviceIP: deviceRefreshToken.deviceIP,
				deviceId: deviceRefreshToken.deviceId,
				deviceName: deviceRefreshToken.deviceName,
			},
		})

		return this.mapDbDeviceTokenToServiceDeviceToken(deviceToken)
	}

	mapDbDeviceTokenToServiceDeviceToken(dbDeviceToken: DeviceToken): DeviceTokenServiceModel {
		return {
			issuedAt: dbDeviceToken.issuedAt,
			expirationDate: dbDeviceToken.expirationDate,
			deviceIP: dbDeviceToken.deviceId,
			deviceId: dbDeviceToken.deviceId,
			deviceName: dbDeviceToken.deviceName,
			userId: dbDeviceToken.userId,
		}
	}
}
