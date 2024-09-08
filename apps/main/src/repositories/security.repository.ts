import { Injectable } from '@nestjs/common'
import { PrismaService } from '../db/prisma.service'
import { DeviceToken } from '@prisma/client'
import { DeviceRefreshTokenServiceModel } from '../models/security/security.service.model'

@Injectable()
export class SecurityRepository {
	constructor(private prisma: PrismaService) {}

	async terminateAllDeviceRefreshTokensApartThis(currentDeviceId: string) {
		await this.prisma.deviceToken.deleteMany({
			where: { NOT: { device_id: currentDeviceId } },
		})
	}

	async deleteRefreshTokenByDeviceId(deviceId: string) {
		await this.prisma.deviceToken.deleteMany({
			where: { device_id: deviceId },
		})
	}

	async getUserDevicesByDeviceId(deviceId: string) {
		const userByDeviceToken = await this.prisma.deviceToken.findFirst({
			where: { device_id: deviceId },
		})

		if (!userByDeviceToken) {
			return null
		}

		const { user_id } = userByDeviceToken

		const userDevices = await this.prisma.deviceToken.findMany({
			where: { user_id },
		})

		if (!userDevices.length) {
			return null
		}

		return userDevices.map(this.mapDbDeviceRefreshTokenToServiceDeviceRefreshToken)
	}

	mapDbDeviceRefreshTokenToServiceDeviceRefreshToken(
		dbDevice: DeviceToken,
	): DeviceRefreshTokenServiceModel {
		return {
			id: dbDevice.id,
			issuedAt: dbDevice.issued_at,
			expirationDate: dbDevice.expiration_date,
			deviceIP: dbDevice.device_ip,
			deviceId: dbDevice.device_id,
			deviceName: dbDevice.device_name,
			userId: dbDevice.user_id,
		}
	}
}
