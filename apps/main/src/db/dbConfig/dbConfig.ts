import { BdConfig } from './dbConfigType'

/**
 * Database structure.
 * With help of this structure, it is formed schema.prisma and class-validator set of decorators to check field in DTO.
 */
export const bdConfig = {
	User: {
		dtoProps: {
			password: {
				type: 'string',
				minLength: 6,
				maxLength: 20,
				match: /[0-9A-Za-z!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/,
				matchErrorMessage: 'Password must contain letters, numbers and other symbols',
			},
		},
		dbFields: {
			id: {
				type: 'index',
			},
			email: {
				type: 'email',
				unique: true,
			},
			name: {
				type: 'string',
				unique: true,
				minLength: 6,
				maxLength: 30,
				match: /^[A-Za-z0-9_-]+$/,
				matchErrorMessage:
					'Password must contain only letters, numbers and !"#$%&\'()*+,\\-./:;<=>?@[\\\\\\]^_{|}~ symbols',
			},
			hashedPassword: {
				type: 'string',
			},
			emailConfirmationCode: {
				type: 'string',
				required: false,
			},
			emailConfirmationCodeExpirationDate: {
				type: 'string',
				required: false,
			},
			isEmailConfirmed: {
				type: 'boolean',
				default: false,
			},
			passwordRecoveryCode: {
				type: 'string',
				required: false,
			},
		},
	},
} satisfies BdConfig.Root
