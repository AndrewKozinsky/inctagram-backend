import {
	ErrorCode,
	ErrorMessage,
	SuccessCode,
} from '../../infrastructure/exceptionFilters/layerResult'
import { SWEmptyRouteOut } from '../routesConfig/swaggerTypesCommon'
import { RoutesConfig } from '../routesConfig/routesConfigTypes'
import { SWEditUserProfileRouteOut, SWUserMeGetAvatarRouteOut } from './swaggerTypes'

export const usersRoutesConfig = {
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
				{
					code: ErrorCode.Unauthorized_401,
					errors: [
						ErrorMessage.AccessTokenIsNotValid,
						ErrorMessage.RefreshTokenIsNotValid,
					],
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
				{
					code: ErrorCode.BadRequest_400,
					errors: [ErrorMessage.UserNotFound],
				},
				{
					code: ErrorCode.Unauthorized_401,
					errors: [
						ErrorMessage.AccessTokenIsNotValid,
						ErrorMessage.RefreshTokenIsNotValid,
					],
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
				{
					code: ErrorCode.Unauthorized_401,
					errors: [
						ErrorMessage.AccessTokenIsNotValid,
						ErrorMessage.RefreshTokenIsNotValid,
					],
				},
			],
		},
		editProfile: {
			response: [
				{
					code: SuccessCode.Ok,
					description: "User's avatar was filled in",
					dataClass: SWEditUserProfileRouteOut,
				},
			],
		},
	},
} satisfies RoutesConfig.Root
