import { ErrorCode, ErrorMessage, SuccessCode } from '../../../../../libs/layerResult'
import { AuthController } from '../auth/auth.controller'
import { BdConfig } from '../../db/dbConfig/dbConfigType'

type MethodNames<T> = {
	[K in keyof T]: T[K] extends (...args: any[]) => any ? K : never
}[keyof T]

type RouteName = MethodNames<AuthController>

export namespace RoutesConfig {
	export type Root = Record<RouteName, Route>

	export type Route = {
		body?: Body
		response: Response
	}

	export type Body = {
		className: string
		filePath: string
		fields: Record<string, BodyField>
	}

	export type BodyField = {
		type: 'string'
		config: BdConfig.Field
	}

	export type Response = (ResponseSuccessBlock | ResponseErrorBlock)[]
	export type ResponseSuccessBlock = {
		code: SuccessCode
		description: string
		dataClass: any
	}
	export type ResponseErrorBlock = {
		code: ErrorCode
		errors: ErrorMessage[]
	}
}
