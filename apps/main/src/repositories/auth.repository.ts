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
			where: { deviceId: deviceId },
		})
		// const token = await this.dataSource.getRepository(DeviceToken).findOneBy({ deviceId })

		if (!token) return null

		return this.mapDbDeviceTokenToServiceDeviceToken(token)
	}

	async deleteDeviceRefreshTokenByDeviceId(deviceId: string): Promise<void> {
		this.prisma.deviceToken.deleteMany({ where: { deviceId: deviceId } })
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
