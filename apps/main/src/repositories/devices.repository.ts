import { Injectable } from '@nestjs/common'
import { DeviceToken } from '@prisma/client'
import { JwtAdapterService } from '@app/jwt-adapter'
import { addMilliseconds } from 'date-fns'
import { MainConfigService } from '@app/config'
import { PrismaService } from '../db/prisma.service'
import { DeviceTokenServiceModel } from '../models/auth/auth.service.model'
import { DeviceRefreshTokenServiceModel } from '../models/security/security.service.model'

@Injectable()
export class DevicesRepository {
	constructor(
		private prisma: PrismaService,
		private jwtAdapter: JwtAdapterService,
		private mainConfig: MainConfigService,
	) {}

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

		return this.mapDbDeviceRefreshTokenToServiceDeviceRefreshToken(token)
	}

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

	async insertDeviceRefreshToken(
		deviceRefreshToken: DeviceTokenServiceModel,
	): Promise<DeviceTokenServiceModel> {
		const deviceToken = await this.prisma.deviceToken.create({
			data: {
				issued_at: new Date(deviceRefreshToken.issuedAt).toISOString(),
				user_id: deviceRefreshToken.userId,
				expiration_date: new Date(deviceRefreshToken.expirationDate).toISOString(),
				device_ip: deviceRefreshToken.deviceIP,
				device_id: deviceRefreshToken.deviceId,
				device_name: deviceRefreshToken.deviceName,
			},
		})

		return this.mapDbDeviceRefreshTokenToServiceDeviceRefreshToken(deviceToken)
	}

	async updateDeviceRefreshTokenDate(deviceId: string) {
		const issuedAt = new Date().toISOString()

		const expirationDate = new Date(
			addMilliseconds(new Date(), this.mainConfig.get().refreshToken.lifeDurationInMs),
		).toISOString()

		this.prisma.deviceToken.updateMany({
			where: { device_id: deviceId },
			data: { issued_at: issuedAt, expiration_date: expirationDate },
		})
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
