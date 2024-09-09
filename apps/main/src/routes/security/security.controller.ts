import { Controller, Delete, Get, Param, Req, UseGuards } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { Request } from 'express'
import RouteNames from '../routesConfig/routeNames'
import { RouteDecorators } from '../routesConfig/routesDecorators'
import { routesConfig } from '../routesConfig/routesConfig'
import { createFailResp, createSuccessResp } from '../routesConfig/createHttpRouteBody'
import { SWEmptyRouteOut, SWGetUserDevicesRouteOut } from '../auth/swaggerTypes'
import { CheckDeviceRefreshTokenGuard } from '../../infrastructure/guards/checkDeviceRefreshToken.guard'
import { BrowserServiceService } from '@app/browser-service'
import { SecurityQueryRepository } from '../../repositories/security.queryRepository'
import {
	TerminateAllDeviceRefreshTokensApartThisCommand,
	TerminateAllDeviceRefreshTokensApartThisHandler,
} from '../../features/security/TerminateAllDeviceRefreshTokensApartThis.commandHandler'
import {
	TerminateUserDeviceCommand,
	TerminateUserDeviceHandler,
} from '../../features/security/TerminateUserDevice.commandHandler'

@Controller(RouteNames.SECURITY.value)
export class SecurityController {
	constructor(
		private readonly commandBus: CommandBus,
		private browserService: BrowserServiceService,
		private securityQueryRepository: SecurityQueryRepository,
	) {}

	// Returns all devices with active sessions for current user
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Get(RouteNames.SECURITY.DEVICES.value)
	@RouteDecorators(routesConfig.getUserDevices)
	async getUserDevices(@Req() req: Request): Promise<SWGetUserDevicesRouteOut | undefined> {
		try {
			const refreshTokenFromCookie = this.browserService.getRefreshTokenStrFromReq(req)

			const userDevices =
				await this.securityQueryRepository.getUserDevices(refreshTokenFromCookie)

			return createSuccessResp(routesConfig.getUserDevices, userDevices)
		} catch (err: any) {
			createFailResp(routesConfig.getUserDevices, err)
		}
	}

	// Terminate all other (exclude current) device's sessions
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Delete(RouteNames.SECURITY.DEVICES.value)
	@RouteDecorators(routesConfig.terminateUserDevicesExceptOne)
	async terminateUserDevicesExceptOne(@Req() req: Request): Promise<SWEmptyRouteOut | undefined> {
		try {
			const refreshTokenFromCookie = this.browserService.getRefreshTokenStrFromReq(req)

			await this.commandBus.execute<
				any,
				ReturnType<typeof TerminateAllDeviceRefreshTokensApartThisHandler.prototype.execute>
			>(new TerminateAllDeviceRefreshTokensApartThisCommand(refreshTokenFromCookie))

			return createSuccessResp(routesConfig.terminateUserDevicesExceptOne, null)
		} catch (err: any) {
			createFailResp(routesConfig.terminateUserDevicesExceptOne, err)
		}
	}

	// Terminate specified device session
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Delete(RouteNames.SECURITY.DEVICES.value + '/:deviceId')
	async terminateUserDevice(@Param('deviceId') deviceId: string, @Req() req: Request) {
		try {
			const refreshToken = this.browserService.getRefreshTokenStrFromReq(req)

			await this.commandBus.execute<
				any,
				ReturnType<typeof TerminateUserDeviceHandler.prototype.execute>
			>(new TerminateUserDeviceCommand(refreshToken, deviceId))

			return createSuccessResp(routesConfig.terminateUserDevice, null)
		} catch (err: any) {
			console.log(err)
			createFailResp(routesConfig.terminateUserDevice, err)
		}
	}
}
