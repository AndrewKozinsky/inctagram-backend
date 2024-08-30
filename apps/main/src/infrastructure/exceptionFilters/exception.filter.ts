import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()
		const request = ctx.getRequest<Request>()
		const status = exception.getStatus()

		const errorObj: ErrorResult = {
			status: 'error',
			code: status,
			message: '',
		}

		if (status === 400) {
			// @ts-ignore
			errorObj.wrongFields = exception.getResponse().message
			errorObj.message = 'Wrong body'
		}

		response.status(status).json(errorObj)
	}
}

type ErrorResult = {
	status: 'error'
	code: number
	message: string
	wrongFields?: { field: string; message: string }[]
}
