import {
	ErrorCode,
	ErrorMessage,
	SuccessCode,
} from '../../infrastructure/exceptionFilters/layerResult'
import { RoutesConfig } from './routesConfigTypes'
import {
	SWAuthorizeByProviderRouteOut,
	SWGetNewAccessAndRefreshTokenRouteOut,
	SWGetUserDevicesRouteOut,
	SWLoginRouteOut,
	SWRegistrationRouteOut,
	SWUserMeGetAvatarRouteOut,
} from '../auth/swaggerTypes'
import { SWEmptyRouteOut } from './swaggerTypesCommon'

export const routesConfig = {
	registration: {
		response: [
			{
				code: SuccessCode.Created_201,
				description: 'Create new user',
				dataClass: SWRegistrationRouteOut,
			},
			{
				code: ErrorCode.BadRequest_400,
				errors: [ErrorMessage.EmailOrUsernameIsAlreadyRegistered],
			},
		],
	},
	authorizeByProvider: {
		response: [
			{
				code: SuccessCode.Ok,
				description: 'Registration and login by GitHub',
				dataClass: SWAuthorizeByProviderRouteOut,
			},
		],
	},
	emailConfirmation: {
		response: [
			{
				code: SuccessCode.Ok,
				description: "Confirm user's email",
				dataClass: SWEmptyRouteOut,
			},
			{
				code: ErrorCode.BadRequest_400,
				errors: [
					ErrorMessage.EmailConfirmationCodeIsExpired,
					ErrorMessage.EmailConfirmationCodeNotFound,
				],
			},
		],
	},
	login: {
		response: [
			{
				code: SuccessCode.Ok,
				description:
					'User is authorized. Returns JWT accessToken (expired after 30 minutes) in body and JWT refreshToken in cookie (expired after 30 days).',
				dataClass: SWLoginRouteOut,
			},
			{
				code: ErrorCode.BadRequest_400,
				errors: [ErrorMessage.EmailOrPasswordDoNotMatch],
			},
			{
				code: ErrorCode.Forbidden_403,
				errors: [ErrorMessage.EmailIsNotConfirmed],
			},
		],
	},
	resendConfirmationEmail: {
		response: [
			{
				code: SuccessCode.Ok,
				description: 'Send confirmation email letter',
				dataClass: SWEmptyRouteOut,
			},
			{
				code: ErrorCode.BadRequest_400,
				errors: [ErrorMessage.EmailNotFound],
			},
		],
	},

	logout: {
		response: [
			{
				code: SuccessCode.Ok,
				description: 'Log out user',
				dataClass: SWEmptyRouteOut,
			},
			{
				code: ErrorCode.Unauthorized_401,
				errors: [ErrorMessage.RefreshTokenIsNotValid],
			},
		],
	},
	passwordRecovery: {
		response: [
			{
				code: SuccessCode.Ok,
				description: 'Recovery password email was sent',
				dataClass: SWEmptyRouteOut,
			},
			{
				code: ErrorCode.BadRequest_400,
				errors: [ErrorMessage.UserNotFound, ErrorMessage.CaptchaIsWrong],
			},
		],
	},
	newPassword: {
		response: [
			{
				code: SuccessCode.Ok,
				description: 'New password was set',
				dataClass: SWEmptyRouteOut,
			},
			{
				code: ErrorCode.BadRequest_400,
				errors: [ErrorMessage.UserNotFound],
			},
		],
	},
	getNewAccessAndRefreshToken: {
		response: [
			{
				code: SuccessCode.Ok,
				description:
					'Returns new JWT accessToken (expired after 30 minutes) in body and JWT refreshToken in cookie (expired after 30 days).',
				dataClass: SWGetNewAccessAndRefreshTokenRouteOut,
			},
			{
				code: ErrorCode.Unauthorized_401,
				errors: [ErrorMessage.RefreshTokenIsNotValid, ErrorMessage.UserNotFound],
			},
		],
	},
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
	generateAllCountriesAndCities: {
		response: [
			{
				code: SuccessCode.Ok,
				description: 'Countries and cities were generated',
				dataClass: SWEmptyRouteOut,
			},
		],
	},
	users: {
		me: {
			setAvatar: {
				response: [
					{
						code: SuccessCode.Ok,
						description: "User's avatar was added",
						dataClass: SWEmptyRouteOut,
					},
					{
						code: ErrorCode.BadRequest_400,
						errors: [ErrorMessage.FileHasWrongMimeType, ErrorMessage.FileIsTooLarge],
					},
				],
			},
			getAvatar: {
				response: [
					{
						code: SuccessCode.Ok,
						description: "User's avatar url",
						dataClass: SWUserMeGetAvatarRouteOut,
					},
				],
			},
			deleteAvatar: {
				response: [
					{
						code: SuccessCode.Ok,
						description: "User's avatar was deleted",
						dataClass: SWEmptyRouteOut,
					},
				],
			},
		},
	},
} satisfies RoutesConfig.Root
