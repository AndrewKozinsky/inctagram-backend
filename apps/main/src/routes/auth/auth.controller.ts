import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { LoginUserDtoModel, CreateUserDtoModel } from '../../models/user/user.input.model'
import RouteNames from '../../settings/routeNames'
import { CreateUserCommand } from '../../features/user/CreateUser.command'
import { ServerHelperService } from '@app/server-helper'
import { LoginUserCommand } from '../../features/user/LoginUser.command'
import { BrowserServiceService } from '@app/browser-service'
import { Request } from 'express'

@Controller(RouteNames.AUTH.value)
export class AuthController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly serverHelper: ServerHelperService,
		private readonly browserService: BrowserServiceService,
	) {}

	@Post(RouteNames.AUTH.REGISTRATION.value)
	@HttpCode(HttpStatus.CREATED)
	async registration(@Body() body: CreateUserDtoModel) {
		try {
			return await this.commandBus.execute(new CreateUserCommand(body))
		} catch (err: any) {
			this.serverHelper.convertLayerErrToHttpErr(err.message)
		}
	}

	@Post(RouteNames.AUTH.LOGIN.value)
	async login(@Req() req: Request, @Res() res: Response, @Body() body: LoginUserDtoModel) {
		try {
			const clientIP = this.browserService.getClientIP(req)
			const clientName = this.browserService.getClientName(req)

			return await this.commandBus.execute(new LoginUserCommand(body, clientIP, clientName))
		} catch (err: any) {
			this.serverHelper.convertLayerErrToHttpErr(err.message)
		}

		/*const loginServiceRes = await this.loginUseCase.execute(req, body)

		if (
			loginServiceRes.code === LayerErrorCode.Unauthorized_401 ||
			loginServiceRes.code !== LayerSuccessCode.Success
		) {
			throw new UnauthorizedException()
		}

		res.cookie(config.refreshToken.name, loginServiceRes.res.data.refreshTokenStr, {
			maxAge: config.refreshToken.lifeDurationInMs,
			httpOnly: true,
			secure: true,
		})

		res.status(HttpStatus.OK).send({
			accessToken: this.jwtService.createAccessTokenStr(loginServiceRes.res.data.user.id),
		})*/
	}
}
