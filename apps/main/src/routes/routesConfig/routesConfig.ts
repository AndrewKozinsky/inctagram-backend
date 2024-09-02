import { ErrorCode, ErrorMessage, SuccessCode } from '../../../../../libs/layerResult'
import { ApiProperty } from '@nestjs/swagger'
import { RoutesConfig } from './routesConfigTypes'

export class Cat {
	@ApiProperty()
	id: number[]

	@ApiProperty()
	name: string

	@ApiProperty()
	age: number

	@ApiProperty()
	breed: string
}

export const routesConfig: RoutesConfig.Root = {
	registration: [
		{
			code: SuccessCode.Created_201,
			description: 'Create new user',
			dataClass: Cat,
		},
		{
			code: ErrorCode.BadRequest_400,
			errors: [ErrorMessage.EmailOrUsernameIsAlreadyRegistered],
		},
	],
	emailConfirmation: [],
	resendConfirmationEmail: [],
	login: [],
	logout: [],
	passwordRecovery: [],
	newPassword: [],
}
