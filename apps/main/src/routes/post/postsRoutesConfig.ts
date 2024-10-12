import { ErrorCode, SuccessCode } from '../../infrastructure/exceptionFilters/layerResult'
import { RoutesConfig } from '../routesConfig/routesConfigTypes'
import { SWAddPostRouteOut, SWGetPostRouteOut, SWUpdatePostRouteOut } from './swaggerTypes'
import { SWGetAllUsersRouteOut } from '../user/swaggerTypes'
import { ErrorMessage } from '@app/shared'
import { SWEmptyRouteOut } from '../routesConfig/swaggerTypesCommon'

export const postsRoutesConfig = {
	getRecentPosts: {
		response: [
			{
				code: SuccessCode.Ok,
				description: 'Get recent posts',
				dataClass: SWGetAllUsersRouteOut,
			},
		],
	},
	createPost: {
		response: [
			{
				code: SuccessCode.Created_201,
				description: 'Create post',
				dataClass: SWAddPostRouteOut,
			},
		],
	},
	getPost: {
		response: [
			{
				code: SuccessCode.Ok,
				description: 'Get post',
				dataClass: SWGetPostRouteOut,
			},
		],
	},
	updatePost: {
		response: [
			{
				code: SuccessCode.Ok,
				description: 'Update post',
				dataClass: SWUpdatePostRouteOut,
			},
			{
				code: ErrorCode.BadRequest_400,
				errors: [ErrorMessage.PostNotFound, ErrorMessage.PostNotBelongToUser],
			},
		],
	},
	deletePost: {
		response: [
			{
				code: SuccessCode.Ok,
				description: 'Delete post',
				dataClass: SWEmptyRouteOut,
			},
			{
				code: ErrorCode.BadRequest_400,
				errors: [ErrorMessage.PostNotFound, ErrorMessage.PostNotBelongToUser],
			},
		],
	},
} satisfies RoutesConfig.Root
