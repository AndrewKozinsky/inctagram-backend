import { RoutesConfig } from './routesConfigTypes'
import { ErrorMessage } from '../../../../../libs/layerResult'
import { CustomException } from '../../utils/misc'

export async function createSuccessResp(routeConfig: RoutesConfig.Route, data: any) {
	const successAnswerConfig = routeConfig.find((conf) => conf.code.startsWith('2'))

	return {
		status: 'success',
		code: successAnswerConfig?.code || '220',
		data,
	}
}

export function createFailResp(routeConfig: RoutesConfig.Route, err: any) {
	/**
	 * Get array with error response config like
	 * [ { code: '400', errors: [...] } ]
	 */
	const errorAnswerConfigs = routeConfig.filter(
		(conf) => !conf.code.startsWith('2'),
	) as RoutesConfig.ErrorBlock[]

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
