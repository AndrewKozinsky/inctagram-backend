import {
	ErrorCode,
	ErrorMessage,
	SuccessCode,
} from '../../infrastructure/exceptionFilters/layerResult'
import { RoutesConfig } from './routesConfigTypes'
import { bdConfig } from '../../db/dbConfig/dbConfig'
import { UserOutModel } from '../../models/user/user.out.model'
import {
	LoginOutModel,
	RecoveryPasswordOutModel,
	RefreshTokenOutModel,
} from '../../models/auth/auth.output.model'

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
				description:
					'User is authorized. Returns JWT accessToken (expired after 30 minutes) in body and JWT refreshToken in cookie (expired after 30 days).',
				dataClass: LoginOutModel,
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
		response: [
			{
				code: SuccessCode.Ok,
				description: 'Confirmation email was sent',
				dataClass: null,
			},
			{
				code: ErrorCode.BadRequest_400,
				errors: [ErrorMessage.EmailNotFound],
			},
			{
				code: ErrorCode.Forbidden_403,
				errors: [ErrorMessage.EmailIsNotConfirmed],
			},
		],
	},

	logout: {
		response: [
			{
				code: SuccessCode.Ok,
				description: 'User was logged out',
				dataClass: null,
			},
			{
				code: ErrorCode.Unauthorized_401,
				errors: [ErrorMessage.RefreshTokenIsNotValid],
			},
		],
	},
	passwordRecovery: {
		response: [
			{
				code: SuccessCode.Ok,
				description: 'Recovery password email was sent',
				dataClass: RecoveryPasswordOutModel,
			},
			{
				code: ErrorCode.BadRequest_400,
				errors: [ErrorMessage.UserNotFound],
			},
		],
	},
	newPassword: {
		response: [
			{
				code: SuccessCode.Ok,
				description: 'New password was set',
				dataClass: null,
			},
			{
				code: ErrorCode.BadRequest_400,
				errors: [ErrorMessage.UserNotFound],
			},
		],
	},
	refreshToken: {
		response: [
			{
				code: SuccessCode.Ok,
				description:
					'Returns new JWT accessToken (expired after 30 minutes) in body and JWT refreshToken in cookie (expired after 30 days).',
				dataClass: RefreshTokenOutModel,
			},
			{
				code: ErrorCode.Unauthorized_401,
				errors: [ErrorMessage.RefreshTokenIsNotValid, ErrorMessage.UserNotFound],
			},
		],
	},
	regByGithubAndGetTokens: { response: [] },
	regByGoogleAndGetTokens: { response: [] },
}
