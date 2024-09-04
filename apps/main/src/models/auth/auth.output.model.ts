import { ApiProperty } from '@nestjs/swagger'

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
}

export class RecoveryPasswordOutModel {
	@ApiProperty()
	recoveryCode: string
}

export class RefreshTokenOutModel {
	@ApiProperty()
	accessToken: string
}
