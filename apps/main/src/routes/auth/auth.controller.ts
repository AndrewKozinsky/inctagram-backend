import { Body, Controller, Get, HttpStatus, Post, Query, Req, Res, UseGuards } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { Request, Response } from 'express'
import { MainConfigService } from '@app/config'
import { JwtAdapterService } from '@app/jwt-adapter'
import { CreateUserDtoModel, SetNewPasswordDtoModel } from '../../models/user/user.input.model'
import RouteNames from '../routesConfig/routeNames'
import { CreateUserCommand } from '../../features/user/CreateUser.command'
import { ServerHelperService } from '@app/server-helper'
import { LoginCommand } from '../../features/auth/Login.command'
import { BrowserServiceService } from '@app/browser-service'
import { CheckDeviceRefreshTokenGuard } from '../../infrastructure/guards/checkDeviceRefreshToken.guard'
import { LogoutCommand } from '../../features/auth/Logout.command'
import { ConfirmEmailCommand } from '../../features/auth/ConfirmEmail.command'
import { ResendConfirmationEmailCommand } from '../../features/auth/ResendConfirmationEmail.command'
import {
	ConfirmEmailQueries,
	GetBlogsQueriesPipe,
	LoginDtoModel,
	PasswordRecoveryDtoModel,
	ResendConfirmationEmailDtoModel,
} from '../../models/auth/auth.input.model'
import { RecoveryPasswordCommand } from '../../features/auth/RecoveryPassword.command'
import { SetNewPasswordCommand } from '../../features/auth/SetNewPassword.command'
import { RouteDecorators } from '../routesConfig/routesDecorators'
import { routesConfig } from '../routesConfig/routesConfig'
import {
	createFailResp,
	createSuccessResp,
	SuccessResponse,
} from '../routesConfig/createHttpRouteBody'
import { UserOutModel } from '../../models/user/user.out.model'
import { GenerateAccessAndRefreshTokensCommand } from '../../features/auth/GenerateAccessAndRefreshTokens.command'
import { LoginOutModel } from '../../models/auth/auth.output.model'
import { ApiBearerAuth, ApiCookieAuth, ApiSecurity, ApiTags } from '@nestjs/swagger'

@ApiTags('Auth')
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
	@RouteDecorators(routesConfig.registration)
	async registration(
		@Body() body: CreateUserDtoModel,
	): Promise<SuccessResponse<UserOutModel> | undefined> {
		try {
			const data = await this.commandBus.execute(new CreateUserCommand(body))
			return createSuccessResp<UserOutModel>(routesConfig.registration, data)
		} catch (err: any) {
			createFailResp(routesConfig.registration, err)
		}
	}

	// Confirm registration
	@Get(RouteNames.AUTH.EMAIL_CONFIRMATION.value)
	@RouteDecorators(routesConfig.emailConfirmation)
	async emailConfirmation(
		@Query(new GetBlogsQueriesPipe()) query: ConfirmEmailQueries,
	): Promise<SuccessResponse<null> | undefined> {
		try {
			await this.commandBus.execute(new ConfirmEmailCommand(query.code))
			return createSuccessResp(routesConfig.emailConfirmation, null)
		} catch (err: any) {
			createFailResp(routesConfig.emailConfirmation, err)
		}
	}

	@Post(RouteNames.AUTH.LOGIN.value)
	@RouteDecorators(routesConfig.login)
	async login(@Req() req: Request, @Res() res: Response, @Body() body: LoginDtoModel) {
		try {
			const clientIP = this.browserService.getClientIP(req)
			const clientName = this.browserService.getClientName(req)

			const loginRes = await this.commandBus.execute(
				new LoginCommand(body, clientIP, clientName),
			)
			const { refreshTokenStr, user } = loginRes

			res.cookie(this.mainConfig.get().refreshToken.name, refreshTokenStr, {
				maxAge: this.mainConfig.get().refreshToken.lifeDurationInMs / 1000,
				httpOnly: true,
				secure: true,
			})

			const respData = createSuccessResp<LoginOutModel>(routesConfig.login, {
				accessToken: this.jwtAdapter.createAccessTokenStr(user.id),
			})

			res.status(HttpStatus.OK).send(respData)
		} catch (err: unknown) {
			createFailResp(routesConfig.login, err)
		}
	}

	// Confirmation email resending
	@Post(RouteNames.AUTH.CONFIRM_EMAIL_RESENDING.value)
	@RouteDecorators(routesConfig.resendConfirmationEmail)
	async resendConfirmationEmail(@Body() body: ResendConfirmationEmailDtoModel) {
		try {
			await this.commandBus.execute(new ResendConfirmationEmailCommand(body.email))
			return createSuccessResp(routesConfig.resendConfirmationEmail, null)
		} catch (err: any) {
			createFailResp(routesConfig.resendConfirmationEmail, err)
		}
	}

	@ApiBearerAuth()
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Post(RouteNames.AUTH.LOGOUT.value)
	@RouteDecorators(routesConfig.logout)
	async logout(@Req() req: Request, @Res() res: Response) {
		try {
			const refreshToken = this.browserService.getRefreshTokenStrFromReq(req)

			await this.commandBus.execute(new LogoutCommand(refreshToken))

			res.clearCookie(this.mainConfig.get().refreshToken.name)
			res.status(HttpStatus.OK)
			res.send(createSuccessResp(routesConfig.logout, null))
		} catch (err: unknown) {
			this.serverHelper.convertLayerErrToHttpErr(err)
		}
	}

	// Password recovery via Email confirmation. Email should be sent with RecoveryCode inside
	@Post(RouteNames.AUTH.PASSWORD_RECOVERY.value)
	@RouteDecorators(routesConfig.passwordRecovery)
	async passwordRecovery(@Body() body: PasswordRecoveryDtoModel) {
		try {
			const res = await this.commandBus.execute(new RecoveryPasswordCommand(body.email))
			return createSuccessResp(routesConfig.passwordRecovery, res)
		} catch (err: any) {
			createFailResp(routesConfig.passwordRecovery, err)
		}
	}

	@Post(RouteNames.AUTH.NEW_PASSWORD.value)
	@RouteDecorators(routesConfig.newPassword)
	async newPassword(@Body() body: SetNewPasswordDtoModel) {
		try {
			await this.commandBus.execute(
				new SetNewPasswordCommand(body.recoveryCode, body.newPassword),
			)
			return createSuccessResp(routesConfig.newPassword, null)
		} catch (err: any) {
			createFailResp(routesConfig.newPassword, err)
		}
	}

	// Generate the new pair of access and refresh tokens
	// (in cookie client must send correct refreshToken that will be revoked after refreshing)
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Post(RouteNames.AUTH.REFRESH_TOKEN.value)
	@RouteDecorators(routesConfig.refreshToken)
	async refreshToken(@Req() req: Request, @Res() res: Response) {
		try {
			const { newAccessToken, newRefreshToken } = await this.commandBus.execute(
				new GenerateAccessAndRefreshTokensCommand(req.deviceRefreshToken!),
			)

			const respData = createSuccessResp(routesConfig.refreshToken, {
				accessToken: newAccessToken,
			})

			res.cookie(this.mainConfig.get().refreshToken.name, newRefreshToken, {
				maxAge: this.mainConfig.get().refreshToken.lifeDurationInMs / 1000,
				httpOnly: true,
				secure: true,
			})

			res.status(HttpStatus.OK).send(respData)
		} catch (err: unknown) {
			createFailResp(routesConfig.refreshToken, err)
		}
	}
}
