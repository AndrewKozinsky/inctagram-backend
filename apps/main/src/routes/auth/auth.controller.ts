import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { AuthService } from './auth.service'
import { CreateUserDtoModel } from '../../models/user/user.input.model'
import RouteNames from '../../settings/routeNames'
import { CreateUserCommand } from '../../features/user/CreateUser.command'
import { ServerHelperService } from '@app/server-helper'

@Controller(RouteNames.AUTH.value)
export class AuthController {
	constructor(
		private readonly appService: AuthService,
		private commandBus: CommandBus,
		private serverHelper: ServerHelperService,
	) {}

	@Get()
	getUser() {
		// return this.appService.getUser({ id: 1 })
		return 'Hello World!'
	}

	@Post(RouteNames.AUTH.REGISTRATION.value)
	@HttpCode(HttpStatus.CREATED)
	async createUser(@Body() body: CreateUserDtoModel) {
		try {
			return await this.commandBus.execute(new CreateUserCommand(body))
		} catch (err: any) {
			this.serverHelper.convertLayerErrToHttpErr(err.message)
		}
	}
}
