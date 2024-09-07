import { ApiProperty } from '@nestjs/swagger'
import { UserOutModel } from '../user/user.out.model'

export type DeviceTokenOutModel = {
	issuedAt: string
	expirationDate: string
	deviceIP: string
	deviceId: string
	deviceName: string
	userId: number
}

export class LoginOutModel {
	@ApiProperty()
	accessToken: string

	@ApiProperty()
	user: UserOutModel
}

export class RecoveryPasswordOutModel {
	@ApiProperty()
	recoveryCode: string
}

export class RefreshTokenOutModel {
	@ApiProperty()
	accessToken: string
}
