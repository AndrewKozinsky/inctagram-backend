import { UserOutModel } from '../user/user.out.model'
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
	@ApiProperty({ type: 'string' })
	accessToken: string
	user: UserOutModel
}
