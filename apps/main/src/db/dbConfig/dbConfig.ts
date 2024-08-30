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
				description: "User's password",
				example: '$1Hn[595n8]T',
			},
			recoveryCode: {
				type: 'string',
				minLength: 1,
				maxLength: 100,
				description: 'The code that the server sent after the password recovery request',
				example: 'z151JPS16j',
			},
		},
		dbFields: {
			id: {
				type: 'index',
			},
			email: {
				type: 'email',
				unique: true,
				description: "User's email",
			},
			name: {
				type: 'string',
				unique: true,
				minLength: 6,
				maxLength: 30,
				match: /^[A-Za-z0-9_-]+$/,
				matchErrorMessage:
					'Password must contain only letters, numbers and !"#$%&\'()*+,\\-./:;<=>?@[\\\\\\]^_{|}~ symbols',
				description: "User's name",
				example: 'Andrew',
			},
			hashedPassword: {
				type: 'string',
				description: "Hashed user's password",
				example: 'z151JPS16jz151JPS16j',
			},
			emailConfirmationCode: {
				type: 'string',
				required: false,
				minLength: 1,
				maxLength: 100,
				description: 'The code with which the user must confirm his email',
				example: '1836',
			},
			emailConfirmationCodeExpirationDate: {
				type: 'string',
				required: false,
				description: 'The date when email confirmation code will be expired',
				example: '2024-08-30T08:43:48.596Z',
			},
			isEmailConfirmed: {
				type: 'boolean',
				default: false,
				description: "Is user's email confirmed",
				example: true,
			},
			passwordRecoveryCode: {
				type: 'string',
				required: false,
				description:
					'The code with which the user must to confirm, that he ask for password recovery',
				example: '1836',
			},
			DeviceToken: {
				type: 'oneToMany',
			},
		},
	},
	DeviceToken: {
		dtoProps: {},
		dbFields: {
			id: {
				type: 'index',
			},
			issuedAt: {
				type: 'string',
				description: 'When device token was created',
			},
			expirationDate: {
				type: 'string',
				description: 'When device token will be expired',
			},
			deviceIP: {
				type: 'string',
				description: 'Token device IP address',
			},
			deviceId: {
				type: 'string',
				description: 'Token device ID',
			},
			deviceName: {
				type: 'string',
				description: 'Token device name',
			},
			userId: {
				type: 'manyToOne',
				thisField: 'userId',
				foreignTable: 'User',
				foreignField: 'id',
			},
		},
	},
} satisfies BdConfig.Root
