import { CreateUserDtoModel } from '../../models/user/user.input.model'

export class CreateUserCommand {
	constructor(public readonly createUserDto: CreateUserDtoModel) {}
}
