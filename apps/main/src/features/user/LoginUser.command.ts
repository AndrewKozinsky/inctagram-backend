import { LoginUserDtoModel } from '../../models/user/user.input.model'

export class LoginUserCommand {
	constructor(
		public readonly loginUserDto: LoginUserDtoModel,
		public readonly clientIP: string,
		public readonly clientName: string,
	) {}
}
