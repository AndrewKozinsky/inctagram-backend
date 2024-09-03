import { ErrorCode, SuccessCode } from '../../infrastructure/exceptionFilters/layerResult'
import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common'
import {
	ApiBadRequestResponse,
	ApiCreatedResponse,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { RoutesConfig } from './routesConfigTypes'

export function RouteDecorators(routeConfig: RoutesConfig.Route) {
	const decorators: any[] = []

	routeConfig.response.forEach((codeObj) => {
		switch (codeObj.code) {
			case SuccessCode.Ok: {
				decorators.push(HttpCode(HttpStatus.OK))
				decorators.push(
					ApiOkResponse({ description: codeObj.description, type: codeObj.dataClass }),
				)
				break
			}
			case SuccessCode.Created_201: {
				decorators.push(HttpCode(HttpStatus.CREATED))
				decorators.push(
					ApiCreatedResponse({
						description: codeObj.description,
						type: codeObj.dataClass,
					}),
				)
				break
			}
			case ErrorCode.BadRequest_400: {
				decorators.push(
					ApiBadRequestResponse({ description: createErrorDescription(codeObj.errors) }),
				)
				break
			}
			case ErrorCode.Unauthorized_401: {
				decorators.push(
					ApiUnauthorizedResponse({
						description: createErrorDescription(codeObj.errors),
					}),
				)
				break
			}
			case ErrorCode.Forbidden_403: {
				decorators.push(
					ApiForbiddenResponse({ description: createErrorDescription(codeObj.errors) }),
				)
				break
			}
			case ErrorCode.NotFound_404: {
				decorators.push(
					ApiNotFoundResponse({ description: createErrorDescription(codeObj.errors) }),
				)
				break
			}
			default: {
				throw new Error('Unknown route decorator code')
			}
		}
	})

	return applyDecorators(...decorators)
}

function createErrorDescription(errors: string[]) {
	return errors.join(' _🐈_ ')
}
