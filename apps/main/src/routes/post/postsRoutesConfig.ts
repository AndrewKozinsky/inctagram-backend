import { ErrorCode, SuccessCode } from '../../infrastructure/exceptionFilters/layerResult'
import { SWEmptyRouteOut } from '../routesConfig/swaggerTypesCommon'
import { RoutesConfig } from '../routesConfig/routesConfigTypes'
import { ErrorMessage } from '@app/shared'
import { SWAddPostRouteOut } from './swaggerTypes'

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
			/*{
				code: ErrorCode.Unauthorized_401,
				errors: [
					ErrorMessage.AccessTokenIsNotValid,
					ErrorMessage.RefreshTokenIsNotValid,
				],
			},*/
		],
	},
} satisfies RoutesConfig.Root
