import { Body, Controller, Get, HttpStatus, Post, Query, Req, Res, UseGuards } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { Request, Response } from 'express'
import { MainConfigService } from '@app/config'
import { JwtAdapterService } from '@app/jwt-adapter'
import {
	CreateUserDtoModel,
	ProviderNameQueryModel,
	SetNewPasswordDtoModel,
} from '../../models/user/user.input.model'
import RouteNames from '../routesConfig/routeNames'
import { ErrorMessage } from '@app/shared'
import { BrowserServiceService } from '@app/browser-service'
import { CheckDeviceRefreshTokenGuard } from '../../infrastructure/guards/checkDeviceRefreshToken.guard'
import {
	ConfirmEmailQueries,
	ConfirmEmailQueriesPipe,
	LoginDtoModel,
	PasswordRecoveryDtoModel,
	ResendConfirmationEmailDtoModel,
} from '../../models/auth/auth.input.model'
import { RouteDecorators } from '../routesConfig/routesDecorators'
import { createFailResp, createSuccessResp } from '../routesConfig/createHttpRouteBody'
import { LoginOutModel } from '../../models/auth/auth.output.model'
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger'
import {
	RegByProviderAndLoginCommand,
	RegByProviderAndLoginHandler,
} from '../../features/user/RegByGithubAndGetTokens.command'
import { AuthService } from './auth.service'
import {
	GenerateAccessAndRefreshTokensCommand,
	GenerateAccessAndRefreshTokensHandler,
} from '../../features/auth/GenerateAccessAndRefreshTokens.command'
import { ConfirmEmailCommand, ConfirmEmailHandler } from '../../features/auth/ConfirmEmail.command'
import { LoginCommand, LoginHandler } from '../../features/auth/Login.command'
import { ResendConfirmationEmailCommand } from '../../features/auth/ResendConfirmationEmail.command'
import { LogoutCommand, LogoutHandler } from '../../features/auth/Logout.command'
import {
	RecoveryPasswordCommand,
	RecoveryPasswordHandler,
} from '../../features/auth/RecoveryPassword.command'
import { SetNewPasswordCommand } from '../../features/auth/SetNewPassword.command'
import { CreateUserCommand, CreateUserHandler } from '../../features/user/CreateUser.command'
import {
	SWAuthorizeByProviderRouteOut,
	SWGetNewAccessAndRefreshTokenRouteOut,
	SWLoginRouteOut,
	SWRegistrationRouteOut,
} from './swaggerTypes'
import { ReCaptchaAdapterService } from '@app/re-captcha-adapter'
import { SWEmptyRouteOut } from '../routesConfig/swaggerTypesCommon'
import { CheckAccessTokenGuard } from '../../infrastructure/guards/checkAccessToken.guard'
import { authRoutesConfig } from './authRoutesConfig'

@ApiTags('Auth')
@Controller(RouteNames.AUTH.value)
export class AuthController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly browserService: BrowserServiceService,
		private mainConfig: MainConfigService,
		private jwtAdapter: JwtAdapterService,
		private authService: AuthService,
		private reCaptchaAdapter: ReCaptchaAdapterService,
	) {}

	@Post(RouteNames.AUTH.REGISTRATION.value)
	@RouteDecorators(authRoutesConfig.registration)
	async registration(
		@Body() body: CreateUserDtoModel,
	): Promise<SWRegistrationRouteOut | undefined> {
		try {
			const commandRes = await this.commandBus.execute<
				any,
				ReturnType<typeof CreateUserHandler.prototype.execute>
			>(new CreateUserCommand(body))

			return createSuccessResp(authRoutesConfig.registration, commandRes)
		} catch (err: any) {
			createFailResp(authRoutesConfig.registration, err)
		}
	}

	// Register by GitHub or Google and get access and refresh tokens
	@Get(RouteNames.AUTH.REGISTRATION.value + '/' + RouteNames.AUTH.REGISTRATION.BY_PROVIDER.value)
	@RouteDecorators(authRoutesConfig.authorizeByProvider)
	async authorizeByProvider(
		@Req() req: Request,
		@Res() res: Response,
		@Query() query: ProviderNameQueryModel,
		@Query('code') providerCode: string,
	) {
		try {
			const clientIP = this.browserService.getClientIP(req)
			const clientName = this.browserService.getClientName(req)
			const isReqFromLocalhost = this.browserService.isReqFromLocalhost(req)
			console.log({ isReqFromLocalhost })

			const authData = await this.commandBus.execute<
				any,
				ReturnType<typeof RegByProviderAndLoginHandler.prototype.execute>
			>(
				new RegByProviderAndLoginCommand({
					clientIP,
					clientName,
					isReqFromLocalhost,
					providerCode,
					providerName: query.provider,
				}),
			)
			const { refreshTokenStr, user } = authData

			this.authService.setRefreshTokenInCookie(res, refreshTokenStr)

			const commandRes: SWAuthorizeByProviderRouteOut = createSuccessResp<LoginOutModel>(
				authRoutesConfig.authorizeByProvider,
				{
					accessToken: this.jwtAdapter.createAccessTokenStr(user.id),
					user,
				},
			)

			res.status(HttpStatus.OK).send(commandRes)
		} catch (err: any) {
			createFailResp(authRoutesConfig.authorizeByProvider, err)
		}
	}

	// Confirm email
	@Get(RouteNames.AUTH.EMAIL_CONFIRMATION.value)
	@RouteDecorators(authRoutesConfig.emailConfirmation)
	async emailConfirmation(
		@Query(new ConfirmEmailQueriesPipe()) query: ConfirmEmailQueries,
	): Promise<SWEmptyRouteOut | undefined> {
		try {
			await this.commandBus.execute<
				any,
				ReturnType<typeof ConfirmEmailHandler.prototype.execute>
			>(new ConfirmEmailCommand(query.code))

			return createSuccessResp(authRoutesConfig.emailConfirmation, null)
		} catch (err: any) {
			createFailResp(authRoutesConfig.emailConfirmation, err)
		}
	}

	@Post(RouteNames.AUTH.LOGIN.value)
	@RouteDecorators(authRoutesConfig.login)
	async login(@Req() req: Request, @Res() res: Response, @Body() body: LoginDtoModel) {
		try {
			const clientIP = this.browserService.getClientIP(req)
			const clientName = this.browserService.getClientName(req)

			const commandRes = await this.commandBus.execute<
				any,
				ReturnType<typeof LoginHandler.prototype.execute>
			>(new LoginCommand(body, clientIP, clientName))
			const { refreshTokenStr, user } = commandRes

			this.authService.setRefreshTokenInCookie(res, refreshTokenStr)

			const respData: SWLoginRouteOut = createSuccessResp<LoginOutModel>(
				authRoutesConfig.login,
				{
					accessToken: this.jwtAdapter.createAccessTokenStr(user.id),
					user,
				},
			)

			res.status(HttpStatus.OK).send(respData)
		} catch (err: unknown) {
			createFailResp(authRoutesConfig.login, err)
		}
	}

	// Confirmation email resending
	@Post(RouteNames.AUTH.CONFIRM_EMAIL_RESENDING.value)
	@RouteDecorators(authRoutesConfig.resendConfirmationEmail)
	async resendConfirmationEmail(
		@Body() body: ResendConfirmationEmailDtoModel,
	): Promise<SWEmptyRouteOut | undefined> {
		try {
			await this.commandBus.execute(new ResendConfirmationEmailCommand(body.email))
			return createSuccessResp(authRoutesConfig.resendConfirmationEmail, null)
		} catch (err: any) {
			createFailResp(authRoutesConfig.resendConfirmationEmail, err)
		}
	}

	@ApiCookieAuth()
	@ApiBearerAuth('access-token')
	@ApiBearerAuth('refresh-token')
	@UseGuards(CheckAccessTokenGuard)
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Post(RouteNames.AUTH.LOGOUT.value)
	@RouteDecorators(authRoutesConfig.logout)
	async logout(@Req() req: Request, @Res() res: Response) {
		try {
			const refreshToken = this.browserService.getRefreshTokenStrFromReq(req)

			await this.commandBus.execute<any, ReturnType<typeof LogoutHandler.prototype.execute>>(
				new LogoutCommand(refreshToken),
			)

			res.clearCookie(this.mainConfig.get().refreshToken.name)
			res.status(HttpStatus.OK)
			res.send(createSuccessResp(authRoutesConfig.logout, null))
		} catch (err: unknown) {
			createFailResp(authRoutesConfig.logout, err)
		}
	}

	// Password recovery via Email confirmation. Email should be sent with RecoveryCode inside
	@Post(RouteNames.AUTH.PASSWORD_RECOVERY.value)
	@RouteDecorators(authRoutesConfig.passwordRecovery)
	async passwordRecovery(
		@Body() body: PasswordRecoveryDtoModel,
	): Promise<SWEmptyRouteOut | undefined> {
		try {
			const isCaptchaValid = await this.reCaptchaAdapter.isValid(body.recaptchaValue)

			if (!isCaptchaValid) {
				throw new Error(ErrorMessage.CaptchaIsWrong)
			}

			const commandRes = await this.commandBus.execute<
				any,
				ReturnType<typeof RecoveryPasswordHandler.prototype.execute>
			>(new RecoveryPasswordCommand(body.email))

			return createSuccessResp(authRoutesConfig.passwordRecovery, commandRes)
		} catch (err: any) {
			createFailResp(authRoutesConfig.passwordRecovery, err)
		}
	}

	@Post(RouteNames.AUTH.NEW_PASSWORD.value)
	@RouteDecorators(authRoutesConfig.newPassword)
	async newPassword(@Body() body: SetNewPasswordDtoModel): Promise<SWEmptyRouteOut | undefined> {
		try {
			await this.commandBus.execute(
				new SetNewPasswordCommand(body.recoveryCode, body.newPassword),
			)
			return createSuccessResp(authRoutesConfig.newPassword, null)
		} catch (err: any) {
			createFailResp(authRoutesConfig.newPassword, err)
		}
	}

	// Generate the new pair of access and refresh tokens
	// (in cookie client must send correct refreshToken that will be revoked after refreshing)
	@ApiCookieAuth()
	@ApiBearerAuth('access-token')
	@ApiBearerAuth('refresh-token')
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Post(RouteNames.AUTH.REFRESH_TOKEN.value)
	@RouteDecorators(authRoutesConfig.getNewAccessAndRefreshToken)
	async getNewAccessAndRefreshToken(@Req() req: Request, @Res() res: Response) {
		try {
			const { newAccessToken, newRefreshTokenStr } = await this.commandBus.execute<
				any,
				ReturnType<typeof GenerateAccessAndRefreshTokensHandler.prototype.execute>
			>(new GenerateAccessAndRefreshTokensCommand(req.deviceRefreshToken!))

			const respData: SWGetNewAccessAndRefreshTokenRouteOut = createSuccessResp(
				authRoutesConfig.getNewAccessAndRefreshToken,
				{
					accessToken: newAccessToken,
				},
			)

			this.authService.setRefreshTokenInCookie(res, newRefreshTokenStr)

			res.status(HttpStatus.OK).send(respData)
		} catch (err: unknown) {
			createFailResp(authRoutesConfig.getNewAccessAndRefreshToken, err)
		}
	}
}
