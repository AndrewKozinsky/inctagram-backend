import { Controller, Delete, Get, Param, Req, UseGuards } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { Request } from 'express'
import RouteNames from '../routesConfig/routeNames'
import { RouteDecorators } from '../routesConfig/routesDecorators'
import { createFailResp, createSuccessResp } from '../routesConfig/createHttpRouteBody'
import { CheckDeviceRefreshTokenGuard } from '../../infrastructure/guards/checkDeviceRefreshToken.guard'
import { BrowserServiceService } from '@app/browser-service'
import { DevicesQueryRepository } from '../../repositories/devices.queryRepository'
import {
	TerminateAllDeviceRefreshTokensApartThisCommand,
	TerminateAllDeviceRefreshTokensApartThisHandler,
} from '../../features/security/TerminateAllDeviceRefreshTokensApartThis.command'
import {
	TerminateUserDeviceCommand,
	TerminateUserDeviceHandler,
} from '../../features/security/TerminateUserDevice.command'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { SWEmptyRouteOut } from '../routesConfig/swaggerTypesCommon'
import { SWGetUserDevicesRouteOut } from './swaggerTypes'
import { devicesRoutesConfig } from './devicesRoutesConfig'
import { CheckAccessTokenGuard } from '../../infrastructure/guards/checkAccessToken.guard'

@ApiTags('Devices')
@Controller(RouteNames.SECURITY.value)
export class DevicesController {
	constructor(
		private readonly commandBus: CommandBus,
		private browserService: BrowserServiceService,
		private securityQueryRepository: DevicesQueryRepository,
	) {}

	// Returns all devices with active sessions for current user
	@ApiBearerAuth('access-token')
	@ApiBearerAuth('refresh-token')
	@UseGuards(CheckAccessTokenGuard)
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Get(RouteNames.SECURITY.DEVICES.value)
	@RouteDecorators(devicesRoutesConfig.getUserDevices)
	async getUserDevices(@Req() req: Request): Promise<SWGetUserDevicesRouteOut | undefined> {
		try {
			const refreshTokenFromCookie = this.browserService.getRefreshTokenStrFromReq(req)

			const userDevices =
				await this.securityQueryRepository.getUserDevices(refreshTokenFromCookie)

			return createSuccessResp(devicesRoutesConfig.getUserDevices, userDevices)
		} catch (err: any) {
			createFailResp(devicesRoutesConfig.getUserDevices, err)
		}
	}

	// Terminate all other (exclude current) device's sessions
	@ApiBearerAuth('access-token')
	@ApiBearerAuth('refresh-token')
	@UseGuards(CheckAccessTokenGuard)
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Delete(RouteNames.SECURITY.DEVICES.value)
	@RouteDecorators(devicesRoutesConfig.terminateUserDevicesExceptOne)
	async terminateUserDevicesExceptOne(@Req() req: Request): Promise<SWEmptyRouteOut | undefined> {
		try {
			const refreshTokenFromCookie = this.browserService.getRefreshTokenStrFromReq(req)

			await this.commandBus.execute<
				any,
				ReturnType<typeof TerminateAllDeviceRefreshTokensApartThisHandler.prototype.execute>
			>(new TerminateAllDeviceRefreshTokensApartThisCommand(refreshTokenFromCookie))

			return createSuccessResp(devicesRoutesConfig.terminateUserDevicesExceptOne, null)
		} catch (err: any) {
			createFailResp(devicesRoutesConfig.terminateUserDevicesExceptOne, err)
		}
	}

	// Terminate specified device session
	@ApiBearerAuth('access-token')
	@ApiBearerAuth('refresh-token')
	@UseGuards(CheckAccessTokenGuard)
	@UseGuards(CheckDeviceRefreshTokenGuard)
	@Delete(RouteNames.SECURITY.DEVICES.value + '/:deviceId')
	@RouteDecorators(devicesRoutesConfig.terminateUserDevice)
	async terminateUserDevice(
		@Param('deviceId') deviceId: string,
		@Req() req: Request,
	): Promise<SWEmptyRouteOut | undefined> {
		try {
			const refreshToken = this.browserService.getRefreshTokenStrFromReq(req)

			await this.commandBus.execute<
				any,
				ReturnType<typeof TerminateUserDeviceHandler.prototype.execute>
			>(new TerminateUserDeviceCommand(refreshToken, deviceId))

			return createSuccessResp(devicesRoutesConfig.terminateUserDevice, null)
		} catch (err: any) {
			createFailResp(devicesRoutesConfig.terminateUserDevice, err)
		}
	}
}
