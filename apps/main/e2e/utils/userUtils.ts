import { getRequest, postRequest, userEmail, userName, userPassword } from './common'
import RouteNames from '../../src/routes/routesConfig/routeNames'
import { HTTP_STATUSES } from '../../src/settings/config'
import { INestApplication } from '@nestjs/common'
import { UserRepository } from '../../src/repositories/user.repository'

export const userUtils = {
	async createUserWithUnconfirmedEmail(
		app: INestApplication,
		userRepository: UserRepository,
		email?: string,
		password?: string,
	) {
		const fixedEmail = email ?? userEmail
		const fixedPassword = password ?? userPassword

		const firstRegRes = await postRequest(app, RouteNames.AUTH.REGISTRATION.full)
			.send({ name: userName, email: fixedEmail, password: fixedPassword })
			.expect(HTTP_STATUSES.CREATED_201)

		/*const userId = firstRegRes.body.data.id
		return await userRepository.getUserById(userId)*/
	},

	async createUserWithConfirmedEmail(
		app: INestApplication,
		userRepository: UserRepository,
		email?: string,
		password?: string,
	) {
		const user = await this.createUserWithUnconfirmedEmail(app, userRepository, email, password)

		// Confirm email
		/*await getRequest(
			app,
			RouteNames.AUTH.EMAIL_CONFIRMATION.full + '?code=' + user!.emailConfirmationCode,
		).expect(HTTP_STATUSES.OK_200)

		return user*/
	},
}
