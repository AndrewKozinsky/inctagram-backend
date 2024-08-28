import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { Request, Response } from 'express'
import { MainConfigService } from '@app/config'
import { JwtAdapterService } from '@app/jwt-adapter'
import {
	LoginUserDtoModel,
	CreateUserDtoModel,
	AuthRegistrationConfirmationDtoModel,
} from '../../models/user/user.input.model'
import RouteNames from '../../settings/routeNames'
import { CreateUserCommand } from '../../features/user/CreateUser.command'
import { ServerHelperService } from '@app/server-helper'
import { LoginCommand } from '../../features/auth/Login.command'
import { BrowserServiceService } from '@app/browser-service'
import { CheckDeviceRefreshTokenGuard } from '../../infrastructure/guards/checkDeviceRefreshToken.guard'
import { LayerErrorCode } from '../../../../../libs/layerResult'
import { LogoutCommand } from '../../features/auth/Logout.command'
import { ConfirmEmailCommand } from '../../features/auth/ConfirmEmail.command'

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

	// Confirm registration
	@Post(RouteNames.AUTH.EMAIL_CONFIRMATION.value)
	@HttpCode(HttpStatus.NO_CONTENT)
	async registrationConfirmation(@Body() body: AuthRegistrationConfirmationDtoModel) {
		try {
			await this.commandBus.execute(new ConfirmEmailCommand(body.code))
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
				new LoginCommand(body, clientIP, clientName),
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

	// Generate the new pair of access and refresh tokens
	// (in cookie client must send correct refreshToken that will be revoked after refreshing)
	/*@UseGuards(CheckDeviceRefreshTokenGuard)
	@Post(RouteNames.AUTH.REFRESH_TOKEN.value)
	async refreshToken(@Req() req: Request, @Res() res: Response) {
		const generateTokensRes = await this.generateAccessAndRefreshTokensUseCase.execute(
			req.deviceRefreshToken,
		)

		if (
			generateTokensRes.code === LayerErrorCode.Unauthorized_401 ||
			generateTokensRes.code !== LayerSuccessCode.Success
		) {
			throw new UnauthorizedException()
		}

		const { newAccessToken, newRefreshToken } = generateTokensRes.res.data!

		res.cookie(config.refreshToken.name, newRefreshToken, {
			maxAge: config.refreshToken.lifeDurationInMs,
			httpOnly: true,
			secure: true,
		})

		res.status(HttpStatus.OK).send({
			accessToken: newAccessToken,
		})
	}*/

	// Registration email resending.
	/*@UseGuards(RequestsLimiterGuard)
	@Post(RouteNames.AUTH.REGISTRATION_EMAIL_RESENDING.value)
	@HttpCode(HttpStatus.NO_CONTENT)
	async registrationEmailResending(@Body() body: AuthRegistrationEmailResendingDtoModel) {
		const resendingStatus = await this.registrationEmailResendingUseCase.execute(body)

		if (resendingStatus.code === LayerErrorCode.BadRequest_400) {
			throw new BadRequestException()
		}
	}*/

	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Post(RouteNames.AUTH.LOGOUT.value)
	@HttpCode(HttpStatus.NO_CONTENT)
	async logout(@Req() req: Request, @Res() res: Response) {
		try {
			const refreshToken = this.browserService.getRefreshTokenStrFromReq(req)
			if (!refreshToken) {
				throw new Error(LayerErrorCode.Unauthorized_401)
			}

			await this.commandBus.execute(new LogoutCommand(refreshToken))

			res.clearCookie(this.mainConfig.get().refreshToken.name)
			res.sendStatus(HttpStatus.NO_CONTENT)
		} catch (err: unknown) {
			this.serverHelper.convertLayerErrToHttpErr(err)
		}
	}

	// Password recovery via Email confirmation. Email should be sent with RecoveryCode inside
	/*@UseGuards(RequestsLimiterGuard)
	@Post(RouteNames.AUTH.PASSWORD_RECOVERY.value)
	@HttpCode(HttpStatus.NO_CONTENT)
	async passwordRecovery(@Body() body: AuthPasswordRecoveryDtoModel) {
		const passwordRecoveryServiceRes = await this.recoveryPasswordUseCase.execute(body.email)

		if (passwordRecoveryServiceRes.code !== LayerSuccessCode.Success) {
			throw new BadRequestException()
		}

		// 204 Even if current email is not registered (for prevent user's email detection)
	}*/

	/*@UseGuards(RequestsLimiterGuard)
	@Post(RouteNames.AUTH.NEW_PASSWORD.value)
	@HttpCode(HttpStatus.NO_CONTENT)
	async newPassword(@Body() body: AuthNewPasswordDtoModel) {
		const passwordRecoveryServiceRes = await this.setNewPasswordUseCase.execute(
			body.recoveryCode,
			body.newPassword,
		)

		if (passwordRecoveryServiceRes.code !== LayerSuccessCode.Success) {
			throw new BadRequestException()
		}

		// 204 Even if current email is not registered (for prevent user's email detection)
	}*/
}
