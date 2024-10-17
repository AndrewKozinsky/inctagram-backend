import { ErrorCode, SuccessCode } from '../../infrastructure/exceptionFilters/layerResult'
import { RoutesConfig } from '../routesConfig/routesConfigTypes'
import {
	SWAddPostRouteOut,
	SWGetPostRouteOut,
	SWGetRecentPostRouteOut,
	SWUpdatePostRouteOut,
} from './swaggerTypes'
import { ErrorMessage } from '@app/shared'
import { SWEmptyRouteOut } from '../routesConfig/swaggerTypesCommon'

export const postsRoutesConfig = {
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
			{
				code: ErrorCode.NotFound_404,
				errors: [ErrorMessage.PostNotFound],
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
				code: ErrorCode.NotFound_404,
				errors: [ErrorMessage.PostNotFound],
			},
			{
				code: ErrorCode.BadRequest_400,
				errors: [ErrorMessage.PostNotBelongToUser],
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
				code: ErrorCode.NotFound_404,
				errors: [ErrorMessage.PostNotFound],
			},
			{
				code: ErrorCode.BadRequest_400,
				errors: [ErrorMessage.PostNotBelongToUser],
			},
		],
	},
	getRecentPosts: {
		response: [
			{
				code: SuccessCode.Ok,
				description: 'Get recent posts',
				dataClass: SWGetRecentPostRouteOut,
			},
		],
	},
} satisfies RoutesConfig.Root
