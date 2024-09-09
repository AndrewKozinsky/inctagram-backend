import { Injectable } from '@nestjs/common'
import { DeviceToken, User } from '@prisma/client'
import { add } from 'date-fns'
import { ServerHelperService } from '@app/server-helper'
import { HashAdapterService } from '@app/hash-adapter'
import { PrismaService } from '../db/prisma.service'
import { CreateUserDtoModel } from '../models/user/user.input.model'
import { UserServiceModel } from '../models/user/user.service.model'
import { UserOutModel } from '../models/user/user.out.model'
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
