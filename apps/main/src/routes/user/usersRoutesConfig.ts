import { ErrorCode, SuccessCode } from '../../infrastructure/exceptionFilters/layerResult'
import { SWEmptyRouteOut } from '../routesConfig/swaggerTypesCommon'
import { RoutesConfig } from '../routesConfig/routesConfigTypes'
import {
	SWUserProfileRouteOut,
	SWUserMeGetAvatarRouteOut,
	SWUserMeAddAvatarRouteOut,
	SWGetUserPostsRouteOut,
} from './swaggerTypes'
import { ErrorMessage } from '@app/shared'
import { SWGetPostRouteOut } from '../post/swaggerTypes'

export const usersRoutesConfig = {
	me: {
		setAvatar: {
			response: [
				{
					code: SuccessCode.Ok,
					description: "User's avatar was added",
					dataClass: SWUserMeAddAvatarRouteOut,
				},
				{
					code: ErrorCode.BadRequest_400,
					errors: [
						ErrorMessage.FileHasWrongMimeType,
						ErrorMessage.FileIsTooLarge,
						ErrorMessage.FileNotFound,
					],
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
					description: "Get user's avatar url",
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
					description: "Edit user's profile",
					dataClass: SWUserProfileRouteOut,
				},
				{
					code: ErrorCode.Unauthorized_401,
					errors: [
						ErrorMessage.AccessTokenIsNotValid,
						ErrorMessage.RefreshTokenIsNotValid,
						ErrorMessage.DateIsWrong,
					],
				},
			],
		},
		getProfile: {
			response: [
				{
					code: SuccessCode.Ok,
					description: "Get user's profile",
					dataClass: SWUserProfileRouteOut,
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
	},
	posts: {
		getUserPosts: {
			response: [
				{
					code: SuccessCode.Ok,
					description: "Get user's posts",
					dataClass: SWGetUserPostsRouteOut,
				},
			],
		},
	},
} satisfies RoutesConfig.Root
