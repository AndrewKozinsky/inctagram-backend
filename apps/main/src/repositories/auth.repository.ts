import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { add } from 'date-fns'
import { ServerHelperService } from '@app/server-helper'
import { HashAdapterService } from '@app/hash-adapter'
import { PrismaService } from '../prisma.service'
import { CreateUserDtoModel } from '../models/user/user.input.model'
import { UserServiceModel } from '../models/user/user.service.model'
import { DeviceTokenOutModel } from '../models/auth/auth.output.model'

@Injectable()
export class AuthRepository {
	constructor(
		private prisma: PrismaService,
		private serverHelper: ServerHelperService,
		private hashAdapter: HashAdapterService,
	) {}

	async insertDeviceRefreshToken(deviceRefreshToken: DeviceTokenOutModel) {
		/*await this.dataSource.getRepository(DeviceToken).insert({
			issuedAt: new Date(deviceRefreshToken.issuedAt).toISOString(),
			userId: deviceRefreshToken.userId,
			expirationDate: new Date(deviceRefreshToken.expirationDate).toISOString(),
			deviceIP: deviceRefreshToken.deviceIP,
			deviceId: deviceRefreshToken.deviceId,
			deviceName: deviceRefreshToken.deviceName,
		})*/
	}
}
