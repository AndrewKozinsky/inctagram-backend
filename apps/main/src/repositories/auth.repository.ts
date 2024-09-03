import { Injectable } from '@nestjs/common'
import { DeviceToken } from '@prisma/client'
import { PrismaService } from '../db/prisma.service'
import { DeviceTokenServiceModel } from '../models/auth/auth.service.model'
import { JwtAdapterService } from '@app/jwt-adapter'

@Injectable()
export class AuthRepository {
	constructor(
		private prisma: PrismaService,
		private jwtAdapter: JwtAdapterService,
	) {}

	async insertDeviceRefreshToken(
		deviceRefreshToken: DeviceTokenServiceModel,
	): Promise<DeviceTokenServiceModel> {
		const deviceToken = await this.prisma.deviceToken.create({
			data: {
				issued_at: new Date(deviceRefreshToken.issuedAt).toISOString(),
				userId: deviceRefreshToken.userId,
				expiration_date: new Date(deviceRefreshToken.expirationDate).toISOString(),
				device_ip: deviceRefreshToken.deviceIP,
				device_id: deviceRefreshToken.deviceId,
				device_name: deviceRefreshToken.deviceName,
			},
		})

		return this.mapDbDeviceTokenToServiceDeviceToken(deviceToken)
	}

	async getDeviceRefreshTokenByTokenStr(
		tokenStr: string,
	): Promise<null | DeviceTokenServiceModel> {
		try {
			const refreshTokenPayload = this.jwtAdapter.getRefreshTokenDataFromTokenStr(tokenStr)
			return this.getDeviceRefreshTokenByDeviceId(refreshTokenPayload!.deviceId)
		} catch (err: unknown) {
			return null
		}
	}

	async getDeviceRefreshTokenByDeviceId(
		deviceId: string,
	): Promise<null | DeviceTokenServiceModel> {
		const token = await this.prisma.deviceToken.findFirst({
			where: { device_id: deviceId },
		})

		if (!token) return null

		return this.mapDbDeviceTokenToServiceDeviceToken(token)
	}

	async deleteDeviceRefreshTokenByDeviceId(deviceId: string): Promise<void> {
		this.prisma.deviceToken.deleteMany({ where: { device_id: deviceId } })
	}

	mapDbDeviceTokenToServiceDeviceToken(dbDeviceToken: DeviceToken): DeviceTokenServiceModel {
		return {
			issuedAt: dbDeviceToken.issued_at,
			expirationDate: dbDeviceToken.expiration_date,
			deviceIP: dbDeviceToken.device_ip,
			deviceId: dbDeviceToken.device_id,
			deviceName: dbDeviceToken.device_name,
			userId: dbDeviceToken.userId,
		}
	}
}
