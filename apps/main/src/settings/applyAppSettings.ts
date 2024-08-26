import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common'
import cookieParser from 'cookie-parser'
import { useContainer } from 'class-validator'
// import { NextFunction, Request, Response } from 'express'
import { AppModule } from '../app.module'
import { HttpExceptionFilter } from '../infrastructure/exceptionFilters/exception.filter'
// import { JwtService } from '../base/application/jwt.service'
// import { UsersRepository } from '../repositories/users.repository'
// import { SetReqUserMiddleware } from '../infrastructure/middlewares/setReqUser.middleware'

export function applyAppSettings(app: INestApplication) {
	app.use(cookieParser())

	/*app.use(async (req: Request, res: Response, next: NextFunction) => {
		const jwtService = await app.resolve(JwtService)
		const usersRepository = await app.resolve(UsersRepository)

		const userMiddleware = new SetReqUserMiddleware(jwtService, usersRepository)
		await userMiddleware.use(req, res, next)
	})*/

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

	app.useGlobalFilters(new HttpExceptionFilter())
}
