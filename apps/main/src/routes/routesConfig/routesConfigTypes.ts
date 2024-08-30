import { ErrorCode, ErrorMessage, SuccessCode } from '../../../../../libs/layerResult'
import { AuthController } from '../auth/auth.controller'

type MethodNames<T> = {
	[K in keyof T]: T[K] extends (...args: any[]) => any ? K : never
}[keyof T]

type RouteName = MethodNames<AuthController>

export namespace RoutesConfig {
	export type Root = Record<RouteName, Route>

	export type Route = (SuccessBlock | ErrorBlock)[]

	export type SuccessBlock = {
		code: SuccessCode
		description: string
		dataClass: any
	}
	export type ErrorBlock = {
		code: ErrorCode
		errors: ErrorMessage[]
	}
}
