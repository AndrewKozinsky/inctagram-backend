import { RoutesConfig } from './routesConfigTypes'
import { CustomException } from '../../infrastructure/exceptionFilters/customException'
import { ErrorMessage } from '@app/shared'

export type SuccessResponse<T> = {
	status: 'success'
	code: number
	data: T
}

export type FailResponse = {
	status: 'error'
	code: number
	message: string
	wrongFields?: { field: string; message: string }[]
}

export function createSuccessResp<T>(routeConfig: RoutesConfig.Route, data: T): SuccessResponse<T> {
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
