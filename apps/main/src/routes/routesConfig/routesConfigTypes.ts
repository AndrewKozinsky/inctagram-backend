import {
	ErrorCode,
	ErrorMessage,
	SuccessCode,
} from '../../infrastructure/exceptionFilters/layerResult'
import { AuthController } from '../auth/auth.controller'
import { BdConfig } from '../../db/dbConfig/dbConfigType'
import { DevicesController } from '../devices/devices.controller'
import { UserController } from '../user/user.controller'

type MethodNames<T> = {
	[K in keyof T]: T[K] extends (...args: any[]) => any ? K : never
}[keyof T]

type RouteName = MethodNames<AuthController & DevicesController & UserController>

export namespace RoutesConfig {
	export type Root = Record<RouteName, Route>

	export type Route = {
		response: Response
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
