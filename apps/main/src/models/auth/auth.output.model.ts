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
	accessToken: string
	user: UserOutModel
}

export class RecoveryPasswordOutModel {
	recoveryCode: string
}

export class RefreshTokenOutModel {
	accessToken: string
}
