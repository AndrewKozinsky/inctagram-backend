import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { Request, Response } from 'express'
import { MainConfigService } from '@app/config'
import { JwtAdapterService } from '@app/jwt-adapter'
import { LoginUserDtoModel, CreateUserDtoModel } from '../../models/user/user.input.model'
import RouteNames from '../../settings/routeNames'
import { CreateUserCommand } from '../../features/user/CreateUser.command'
import { ServerHelperService } from '@app/server-helper'
import { LoginUserCommand } from '../../features/user/LoginUser.command'
import { BrowserServiceService } from '@app/browser-service'

@Controller(RouteNames.AUTH.value)
export class AuthController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly serverHelper: ServerHelperService,
		private readonly browserService: BrowserServiceService,
		private mainConfig: MainConfigService,
		private jwtAdapter: JwtAdapterService,
	) {}

	@Post(RouteNames.AUTH.REGISTRATION.value)
	@HttpCode(HttpStatus.CREATED)
	async registration(@Body() body: CreateUserDtoModel) {
		try {
			return await this.commandBus.execute(new CreateUserCommand(body))
		} catch (err: unknown) {
			this.serverHelper.convertLayerErrToHttpErr(err)
		}
	}

	@Post(RouteNames.AUTH.LOGIN.value)
	async login(@Req() req: Request, @Res() res: Response, @Body() body: LoginUserDtoModel) {
		try {
			const clientIP = this.browserService.getClientIP(req)
			const clientName = this.browserService.getClientName(req)

			const loginRes = await this.commandBus.execute(
				new LoginUserCommand(body, clientIP, clientName),
			)
			const { refreshTokenStr, user } = loginRes

			res.cookie(this.mainConfig.get().refreshToken.name, refreshTokenStr, {
				maxAge: this.mainConfig.get().refreshToken.lifeDurationInMs,
				httpOnly: true,
				secure: true,
			})

			res.status(HttpStatus.OK).send({
				accessToken: this.jwtAdapter.createAccessTokenStr(user.id),
			})
		} catch (err: unknown) {
			this.serverHelper.convertLayerErrToHttpErr(err)
		}
	}
}
