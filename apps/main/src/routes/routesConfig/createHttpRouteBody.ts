import { RoutesConfig } from './routesConfigTypes'
import { ErrorMessage } from '../../infrastructure/exceptionFilters/layerResult'
import { CustomException } from '../../infrastructure/exceptionFilters/customException'
import { SuccessResponse } from '../../types/commonTypes'

export async function createSuccessResp<T>(
	routeConfig: RoutesConfig.Route,
	data: T,
): Promise<SuccessResponse<T>> {
	const successAnswerConfig = routeConfig.response.find((conf) => conf.code.startsWith('2'))

	return {
		status: 'success',
		code: parseInt(successAnswerConfig?.code || '220'),
		data,
	}
}

export function createFailResp(routeConfig: RoutesConfig.Route, err: any) {
	/**
	 * Get array with error response config like
	 * [ { code: '400', errors: [...] } ]
	 */
	const errorAnswerConfigs = routeConfig.response.filter(
		(conf) => !conf.code.startsWith('2'),
	) as RoutesConfig.ResponseErrorBlock[]

	const message: ErrorMessage = err.message

	const errorAnswerConfig = errorAnswerConfigs.find((conf) => conf.errors.includes(message))
	throw CustomException(errorAnswerConfig?.code || '420', message)
}

// DELETE
/*export async function createHttpRouteBody(routeConfig: RoutesConfig.Route, executor: any) {
	try {
		const data = await executor
		return createSuccessResp(routeConfig, data)
	} catch (err: any) {
		createFailResp(routeConfig, err)
	}
}*/
