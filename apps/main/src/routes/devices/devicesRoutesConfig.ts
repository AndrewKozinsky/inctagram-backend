import { ErrorCode, SuccessCode } from '../../infrastructure/exceptionFilters/layerResult'
import { SWGetUserDevicesRouteOut } from '../devices/swaggerTypes'
import { SWEmptyRouteOut } from '../routesConfig/swaggerTypesCommon'
import { RoutesConfig } from '../routesConfig/routesConfigTypes'
import { ErrorMessage } from '@app/server-helper'

export const devicesRoutesConfig = {
	getUserDevices: {
		response: [
			{
				code: SuccessCode.Ok,
				description: 'Returns all user devices.',
				dataClass: SWGetUserDevicesRouteOut,
			},
		],
	},
	terminateUserDevicesExceptOne: {
		response: [
			{
				code: SuccessCode.Ok,
				description: "Terminate all user's devices except current",
				dataClass: SWEmptyRouteOut,
			},
		],
	},
	terminateUserDevice: {
		response: [
			{
				code: SuccessCode.Ok,
				description: 'Terminate the current user device',
				dataClass: SWEmptyRouteOut,
			},
			{
				code: ErrorCode.Unauthorized_401,
				errors: [ErrorMessage.UserDeviceNotFound],
			},
			{
				code: ErrorCode.Forbidden_403,
				errors: [ErrorMessage.UserDoesNotOwnThisDeviceToken],
			},
			{
				code: ErrorCode.NotFound_404,
				errors: [ErrorMessage.RefreshTokenIsNotFound],
			},
		],
	},
} satisfies RoutesConfig.Root
