import { LoginDtoModel } from '../../models/auth/auth.input.model'

export class LoginCommand {
	constructor(
		public readonly loginUserDto: LoginDtoModel,
		public readonly clientIP: string,
		public readonly clientName: string,
	) {}
}
