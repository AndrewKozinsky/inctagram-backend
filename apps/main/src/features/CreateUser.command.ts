import { CreateUserDtoModel } from '../models/user/users.input.model'

export class CreateUserCommand {
	constructor(public readonly dto: CreateUserDtoModel) {}
}
