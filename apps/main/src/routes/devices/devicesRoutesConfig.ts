import { ErrorMessage } from '@app/shared'
import { ErrorCode, SuccessCode } from '../../infrastructure/exceptionFilters/layerResult'
import { SWGetUserDevicesRouteOut } from './swaggerTypes'
import { SWEmptyRouteOut } from '../routesConfig/swaggerTypesCommon'
import { RoutesConfig } from '../routesConfig/routesConfigTypes'

export const devicesRoutesConfig = {
	getUserDevices: {
		response: [
			{
				code: SuccessCode.Ok,
				description: 'Returns all user devices.',
				dataClass: SWGetUserDevicesRouteOut,
			},
			{
				code: ErrorCode.Unauthorized_401,
				errors: [ErrorMessage.RefreshTokenIsNotValid, ErrorMessage.AccessTokenIsNotValid],
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
			{
				code: ErrorCode.Unauthorized_401,
				errors: [ErrorMessage.RefreshTokenIsNotValid, ErrorMessage.AccessTokenIsNotValid],
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
				errors: [
					ErrorMessage.UserDeviceNotFound,
					ErrorMessage.RefreshTokenIsNotValid,
					ErrorMessage.AccessTokenIsNotValid,
				],
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
