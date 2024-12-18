import { ErrorMessage } from '@app/shared'
import { ErrorCode, SuccessCode } from '../../infrastructure/exceptionFilters/layerResult'
import { RoutesConfig } from '../routesConfig/routesConfigTypes'
import { SWEmptyRouteOut } from '../routesConfig/swaggerTypesCommon'
import {
	SWAddPostRouteOut,
	SWGetPostRouteOut,
	SWGetRecentPostRouteOut,
	SWUpdatePostRouteOut,
	SWUploadPostPhotoRouteOut,
} from './swaggerTypes'

export const postsRoutesConfig = {
	uploadPostPhoto: {
		response: [
			{
				code: SuccessCode.Created_201,
				description: 'Upload post photo',
				dataClass: SWUploadPostPhotoRouteOut,
			},
		],
	},
	deletePostPhoto: {
		response: [
			{
				code: SuccessCode.Ok,
				description: 'Delete post photo',
				dataClass: SWEmptyRouteOut,
			},
		],
	},
	createPost: {
		response: [
			{
				code: SuccessCode.Created_201,
				description: 'Create a post',
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
