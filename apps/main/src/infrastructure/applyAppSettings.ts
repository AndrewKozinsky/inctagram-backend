import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common'
import cookieParser from 'cookie-parser'
import { useContainer } from 'class-validator'
import { JwtAdapterService } from '@app/jwt-adapter'
import { AppModule } from '../app.module'
import { NextFunction, Request, Response } from 'express'
import { SetReqUserMiddleware } from './middlewares/setReqUser.middleware'
import { UserRepository } from '../repositories/user.repository'
import { ErrorExceptionFilter } from './exceptionFilters/exception.filter'

export function applyAppSettings(app: INestApplication) {
	app.enableCors({
		origin: ['http://localhost:3000', 'http://localhost:5173', 'https://sociable-people.com'],
	})

	app.use(cookieParser())

	app.use(async (req: Request, res: Response, next: NextFunction) => {
		const jwtService = await app.resolve(JwtAdapterService)
		const userRepository = await app.resolve(UserRepository)

		const userMiddleware = new SetReqUserMiddleware(jwtService, userRepository)
		await userMiddleware.use(req, res, next)
	})

	// Thus ensuring all endpoints are protected from receiving incorrect data.
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			stopAtFirstError: true,
			exceptionFactory: (errors) => {
				const errorsForResponse: Record<string, string>[] = []

				errors.forEach((e) => {
					// @ts-ignore
					const constraintsKeys = Object.keys(e.constraints)
					constraintsKeys.forEach((cKey) => {
						// @ts-ignore
						errorsForResponse.push({ message: e.constraints[cKey], field: e.property })
					})
				})

				throw new BadRequestException(errorsForResponse)
			},
		}),
	)

	// Это нужно чтобы в проверки через class-validator можно было делать асинхронными
	// и была возможность внедрять классы в класс проверки
	// https://medium.com/yavar/custom-validation-with-database-in-nestjs-ac008f96abe2
	useContainer(app.select(AppModule), { fallbackOnErrors: true })

	app.useGlobalFilters(new ErrorExceptionFilter())
}

export const onUncaughtException = () => {
	process.on('uncaughtException', (e) => {
		console.log('!!! Uncaught Exception: ', e)
	})
}
export const onUnhandledRejection = () => {
	process.on('unhandledRejection', (reason, p) => {
		console.log(
			'!!! Unhandled Rejection',
			reason,
			p.then((x) => console.log('!!! then: ', x)).catch((e) => console.log('!!! catch: ', e)),
		)
	})
}
// отлов ошибок чтоб сервер не падал
export const globalCatch = () => {
	onUncaughtException()
	onUnhandledRejection()
}
