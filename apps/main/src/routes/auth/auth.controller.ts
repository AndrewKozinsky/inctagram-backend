import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Query,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common'
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
import { ServerHelperService } from '@app/server-helper'
import { BrowserServiceService } from '@app/browser-service'
import { CheckDeviceRefreshTokenGuard } from '../../infrastructure/guards/checkDeviceRefreshToken.guard'
import {
	ConfirmEmailQueries,
	GetBlogsQueriesPipe,
	LoginDtoModel,
	PasswordRecoveryDtoModel,
	ResendConfirmationEmailDtoModel,
} from '../../models/auth/auth.input.model'
import { RouteDecorators } from '../routesConfig/routesDecorators'
import { routesConfig } from '../routesConfig/routesConfig'
import { createFailResp, createSuccessResp } from '../routesConfig/createHttpRouteBody'
import { LoginOutModel } from '../../models/auth/auth.output.model'
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger'
import {
	RegByProviderAndLoginCommand,
	RegByProviderAndLoginHandler,
} from '../../features/user/RegByGithubAndGetTokens.commandHandler'
import { AuthService } from './auth.service'
import {
	GenerateAccessAndRefreshTokensCommand,
	GenerateAccessAndRefreshTokensHandler,
} from '../../features/auth/GenerateAccessAndRefreshTokens.commandHandler'
import {
	ConfirmEmailCommand,
	ConfirmEmailHandler,
} from '../../features/auth/ConfirmEmail.commandHandler'
import { LoginCommand, LoginHandler } from '../../features/auth/Login.commandHandler'
import { ResendConfirmationEmailCommand } from '../../features/auth/ResendConfirmationEmail.commandHandler'
import { LogoutCommand, LogoutHandler } from '../../features/auth/Logout.commandHandler'
import {
	RecoveryPasswordCommand,
	RecoveryPasswordHandler,
} from '../../features/auth/RecoveryPassword.commandHandler'
import { SetNewPasswordCommand } from '../../features/auth/SetNewPassword.commandHandler'
import { CreateUserCommand, CreateUserHandler } from '../../features/user/CreateUser.commandHandler'
import {
	SWAuthorizeByProviderRouteOut,
	SWGetNewAccessAndRefreshTokenRouteOut,
	SWLoginRouteOut,
	SWRegistrationRouteOut,
} from './swaggerTypes'
import { ErrorMessage } from '../../infrastructure/exceptionFilters/layerResult'
import { ReCaptchaAdapterService } from '@app/re-captcha-adapter'
import { SWEmptyRouteOut } from '../routesConfig/swaggerTypesCommon'

@ApiTags('Auth')
@Controller(RouteNames.AUTH.value)
export class AuthController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly serverHelper: ServerHelperService,
		private readonly browserService: BrowserServiceService,
		private mainConfig: MainConfigService,
		private jwtAdapter: JwtAdapterService,
		private authService: AuthService,
		private reCaptchaAdapter: ReCaptchaAdapterService,
	) {}

	@Post(RouteNames.AUTH.REGISTRATION.value)
	@RouteDecorators(routesConfig.registration)
	async registration(
		@Body() body: CreateUserDtoModel,
	): Promise<SWRegistrationRouteOut | undefined> {
		try {
			const commandRes = await this.commandBus.execute<
				any,
				ReturnType<typeof CreateUserHandler.prototype.execute>
			>(new CreateUserCommand(body))

			return createSuccessResp(routesConfig.registration, commandRes)
		} catch (err: any) {
			createFailResp(routesConfig.registration, err)
		}
	}

	// Register by GitHub or Google and get access and refresh tokens
	@Get(RouteNames.AUTH.REGISTRATION.value + '/' + RouteNames.AUTH.REGISTRATION.BY_PROVIDER.value)
	@RouteDecorators(routesConfig.authorizeByProvider)
	async authorizeByProvider(
		@Req() req: Request,
		@Res() res: Response,
		@Query() query: ProviderNameQueryModel,
		@Query('code') providerCode: string,
	) {
		try {
			const clientIP = this.browserService.getClientIP(req)
			const clientName = this.browserService.getClientName(req)

			const { refreshTokenStr, user } = await this.commandBus.execute<
				any,
				ReturnType<typeof RegByProviderAndLoginHandler.prototype.execute>
			>(
				new RegByProviderAndLoginCommand({
					clientIP,
					clientName,
					providerCode,
					providerName: query.provider,
				}),
			)

			this.authService.setRefreshTokenInCookie(res, refreshTokenStr)

			const commandRes: SWAuthorizeByProviderRouteOut = createSuccessResp<LoginOutModel>(
				routesConfig.authorizeByProvider,
				{
					accessToken: this.jwtAdapter.createAccessTokenStr(user.id),
					user,
				},
			)

			res.status(HttpStatus.OK).send(commandRes)
		} catch (err: any) {
			createFailResp(routesConfig.authorizeByProvider, err)
		}
	}

	// Confirm email
	@Get(RouteNames.AUTH.EMAIL_CONFIRMATION.value)
	@RouteDecorators(routesConfig.emailConfirmation)
	async emailConfirmation(
		@Query(new GetBlogsQueriesPipe()) query: ConfirmEmailQueries,
	): Promise<SWEmptyRouteOut | undefined> {
		try {
			await this.commandBus.execute<
				any,
				ReturnType<typeof ConfirmEmailHandler.prototype.execute>
			>(new ConfirmEmailCommand(query.code))

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

			const commandRes = await this.commandBus.execute<
				any,
				ReturnType<typeof LoginHandler.prototype.execute>
			>(new LoginCommand(body, clientIP, clientName))
			const { refreshTokenStr, user } = commandRes

			this.authService.setRefreshTokenInCookie(res, refreshTokenStr)

			const respData: SWLoginRouteOut = createSuccessResp<LoginOutModel>(routesConfig.login, {
				accessToken: this.jwtAdapter.createAccessTokenStr(user.id),
				user,
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

	@ApiCookieAuth()
	@ApiBearerAuth('access-token')
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Post(RouteNames.AUTH.LOGOUT.value)
	@RouteDecorators(routesConfig.logout)
	async logout(@Req() req: Request, @Res() res: Response) {
		try {
			const refreshToken = this.browserService.getRefreshTokenStrFromReq(req)

			await this.commandBus.execute<any, ReturnType<typeof LogoutHandler.prototype.execute>>(
				new LogoutCommand(refreshToken),
			)

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

			return createSuccessResp(routesConfig.passwordRecovery, commandRes)
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
	@ApiCookieAuth()
	@ApiBearerAuth('access-token')
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Post(RouteNames.AUTH.REFRESH_TOKEN.value)
	@RouteDecorators(routesConfig.getNewAccessAndRefreshToken)
	async getNewAccessAndRefreshToken(@Req() req: Request, @Res() res: Response) {
		try {
			const { newAccessToken, newRefreshTokenStr } = await this.commandBus.execute<
				any,
				ReturnType<typeof GenerateAccessAndRefreshTokensHandler.prototype.execute>
			>(new GenerateAccessAndRefreshTokensCommand(req.deviceRefreshToken!))

			const respData: SWGetNewAccessAndRefreshTokenRouteOut = createSuccessResp(
				routesConfig.getNewAccessAndRefreshToken,
				{
					accessToken: newAccessToken,
				},
			)

			this.authService.setRefreshTokenInCookie(res, newRefreshTokenStr)

			res.status(HttpStatus.OK).send(respData)
		} catch (err: unknown) {
			createFailResp(routesConfig.getNewAccessAndRefreshToken, err)
		}
	}
}
