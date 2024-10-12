import { ErrorCode, SuccessCode } from '../../infrastructure/exceptionFilters/layerResult'
import { SWEmptyRouteOut } from '../routesConfig/swaggerTypesCommon'
import { RoutesConfig } from '../routesConfig/routesConfigTypes'
import { ErrorMessage } from '@app/shared'
import { SWAddPostRouteOut, SWGetPostRouteOut, SWUpdatePostRouteOut } from './swaggerTypes'

export const postsRoutesConfig = {
	createPost: {
		response: [
			{
				code: SuccessCode.Ok,
				description: 'Create post',
				dataClass: SWAddPostRouteOut,
			},
			/*{
        code: ErrorCode.BadRequest_400,
        errors: [
          ErrorMessage.FileHasWrongMimeType,
          ErrorMessage.FileIsTooLarge,
          ErrorMessage.FileNotFound,
        ],
      },*/
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
		],
	},
} satisfies RoutesConfig.Root
