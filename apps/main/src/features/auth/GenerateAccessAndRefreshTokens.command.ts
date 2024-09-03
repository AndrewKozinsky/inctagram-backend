import { DeviceTokenOutModel } from '../../models/auth/auth.output.model'

export class GenerateAccessAndRefreshTokensCommand {
	constructor(public readonly deviceRefreshToken: DeviceTokenOutModel) {}
}
