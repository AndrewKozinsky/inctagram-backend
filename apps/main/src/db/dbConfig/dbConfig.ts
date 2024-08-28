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
			confirmEmailCode: {
				type: 'string',
				minLength: 1,
				maxLength: 100,
			},
			recoveryCode: {
				type: 'string',
				minLength: 1,
				maxLength: 100,
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
			},
			expirationDate: {
				type: 'string',
			},
			deviceIP: {
				type: 'string',
			},
			deviceId: {
				type: 'string',
			},
			deviceName: {
				type: 'string',
			},
			userId: {
				type: 'manyToOne',
				thisField: 'userId',
				foreignTable: 'User',
				foreignField: 'id',
			},

			// @ManyToOne(() => User, (u) => u.id, { onDelete: 'CASCADE' })
			// user: User
			// @Column('varchar')
			// userId: string
		},
	},
} satisfies BdConfig.Root
