import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateUserDtoModel } from '../../models/user/users.input.model'
import RouteNames from '../../settings/routeNames'

@Controller(RouteNames.AUTH.value)
export class AuthController {
	constructor(private readonly appService: AuthService) {}

	@Get()
	getUser() {
		// return this.appService.getUser({ id: 1 })
		return 'Hello World!'
	}

	@Post(RouteNames.AUTH.REGISTRATION.value)
	@HttpCode(HttpStatus.CREATED)
	async createUser(@Body() body: CreateUserDtoModel) {
		return 'Hello World!'
		/*return this.appService.createUser({
			name: 'User name',
			email: 'user2@email.ru',
		})*/
	}
}
