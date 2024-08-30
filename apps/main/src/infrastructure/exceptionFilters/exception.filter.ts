import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common'
import { Request, Response } from 'express'

type HTTPErrorResponse = {
	response: {
		message: { field: string; message: string }[]
		error: string
		statusCode: number
	}
	status: number
}

type PlainErrorResponse = {
	message: string
}

@Catch()
export class ErrorExceptionFilter implements ExceptionFilter {
	catch(exception: PlainErrorResponse | HTTPErrorResponse, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()
		const request = ctx.getRequest<Request>()

		const body = this.extractErrorCodeAndMessageFromStr(exception)

		response.status(body.code).json(body)
	}

	/**
	 * Transform error object into object like
	 * {status: 'error', code: 400, message: 'My error', wrongFields: [...]}
	 * @param errObj
	 */
	extractErrorCodeAndMessageFromStr(errObj: PlainErrorResponse | HTTPErrorResponse): ErrorResult {
		let code = 0
		let message = ''
		let wrongFields: undefined | { field: string; message: string }[] = undefined

		if ('response' in errObj) {
			code = 400
			message = 'Wrong body'
			wrongFields = errObj.response.message
		} else {
			try {
				const errAndMessageObj = JSON.parse(errObj.message)
				code = parseInt(errAndMessageObj.code)
				message = errAndMessageObj.message
			} catch (error) {
				code = HttpStatus.INTERNAL_SERVER_ERROR
				message = 'Unhandled error'
			}
		}

		return {
			status: 'error',
			code,
			message,
			wrongFields,
		}
	}
}

type ErrorResult = {
	status: 'error'
	code: number
	message: string
	wrongFields?: { field: string; message: string }[]
}
