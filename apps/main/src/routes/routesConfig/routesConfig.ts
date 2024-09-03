import { ErrorCode, ErrorMessage, SuccessCode } from '../../../../../libs/layerResult'
import { RoutesConfig } from './routesConfigTypes'
import { bdConfig } from '../../db/dbConfig/dbConfig'
import { UserOutModel } from '../../models/user/user.out.model'

export const routesConfig: RoutesConfig.Root = {
	registration: {
		body: {
			className: 'CreateUserDtoModel',
			filePath: 'auth/CreateUserDtoModel',
			fields: {
				name: {
					type: 'string',
					config: bdConfig.User.dbFields.name,
				},
				password: {
					type: 'string',
					config: bdConfig.User.dtoProps.password,
				},
				email: {
					type: 'string',
					config: bdConfig.User.dbFields.email,
				},
			},
		},
		response: [
			{
				code: SuccessCode.Created_201,
				description: 'Create new user',
				dataClass: UserOutModel,
			},
			{
				code: ErrorCode.BadRequest_400,
				errors: [ErrorMessage.EmailOrUsernameIsAlreadyRegistered],
			},
		],
	},
	emailConfirmation: {
		response: [
			{
				code: SuccessCode.Ok,
				description: "User's email was confirmed",
				dataClass: null,
			},
			{
				code: ErrorCode.BadRequest_400,
				errors: [
					ErrorMessage.EmailConfirmationCodeIsExpired,
					ErrorMessage.EmailConfirmationCodeNotFound,
				],
			},
		],
	},
	login: {
		response: [
			{
				code: SuccessCode.Ok,
				description: 'User is authorized',
				dataClass: null,
			},
			{
				code: ErrorCode.BadRequest_400,
				errors: [ErrorMessage.EmailOrPasswordDoNotMatch],
			},
			{
				code: ErrorCode.Forbidden_403,
				errors: [ErrorMessage.EmailIsNotConfirmed],
			},
		],
	},
	resendConfirmationEmail: {
		response: [],
	},

	logout: {
		response: [],
	},
	passwordRecovery: {
		response: [],
	},
	newPassword: {
		response: [],
	},
}
