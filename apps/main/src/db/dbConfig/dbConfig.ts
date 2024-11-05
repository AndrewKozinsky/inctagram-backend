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
				required: true,
			},
			recoveryCode: {
				type: 'string',
				minLength: 1,
				maxLength: 100,
				description: 'The code that the server sent after the password recovery request',
				example: 'z151JPS16j',
				required: true,
			},
			recaptchaValue: {
				type: 'string',
				minLength: 1,
				maxLength: 4000,
				required: true,
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
				required: true,
			},
			github_id: {
				type: 'string',
				unique: true,
				description: 'Github ID if user used this way or null',
				required: false,
			},
			google_id: {
				type: 'string',
				unique: true,
				description: 'Google ID if user used this way or null',
				required: false,
			},
			user_name: {
				type: 'string',
				unique: true,
				minLength: 6,
				maxLength: 30,
				matchErrorMessage: 'Name must contain only letters, numbers and _ - symbols',
				description: 'Username',
				example: 'AndrewKozinsky',
				required: true,
			},
			first_name: {
				type: 'string',
				minLength: 1,
				maxLength: 50,
				match: /^[A-Za-zА-Яа-я]+$/,
				matchErrorMessage: 'First name must contain only letters',
				description: "User's first name",
				example: 'Andrew',
				required: false,
			},
			last_name: {
				type: 'string',
				minLength: 1,
				maxLength: 50,
				match: /^[A-Za-zА-Яа-я]+$/,
				matchErrorMessage: 'Last name must contain only letters',
				description: "User's last name",
				example: 'Kozinsky',
				required: false,
			},
			date_of_birth: {
				type: 'dateString',
				description: "User's date of birth",
				example: '2024-09-29T09:18:40.523Z',
				required: false,
			},
			country_code: {
				type: 'string',
				description: 'Code of the country. RU for Russia',
				required: false,
			},
			city_id: {
				type: 'number',
				description: 'Id of the city',
				required: false,
			},
			about_me: {
				type: 'string',
				minLength: 1,
				maxLength: 200,
				description: 'A text about me',
				example:
					'I am a hard-working and driven individual who isn’t afraid to face a challenge.',
				required: false,
			},
			hashed_password: {
				type: 'string',
				description: "Hashed user's password",
				example: 'z151JPS16jz151JPS16j',
				required: true,
			},
			email_confirmation_code: {
				type: 'string',
				required: false,
				minLength: 3,
				maxLength: 100,
				description: 'The code with which the user must confirm his email',
				example: '1836',
			},
			email_confirmation_code_expiration_date: {
				type: 'string',
				required: false,
				description: 'The date when email confirmation code will be expired',
				example: '2024-08-30T08:43:48.596Z',
			},
			is_email_confirmed: {
				type: 'boolean',
				default: false,
				description: "Is user's email confirmed",
				example: true,
				required: true,
			},
			password_recovery_code: {
				type: 'string',
				required: false,
				description:
					'The code with which the user must to confirm, that he ask for password recovery',
				example: '6b459253-6d74-4bc1-bfca-b80447e67cec',
			},
			DeviceToken: {
				type: 'oneToMany',
			},
			Post: {
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
			issued_at: {
				type: 'string',
				description: 'When device token was created',
				required: true,
			},
			expiration_date: {
				type: 'string',
				description: 'When device token will be expired',
				required: true,
			},
			device_ip: {
				type: 'string',
				description: 'Token device IP address',
				required: true,
			},
			device_id: {
				type: 'string',
				description: 'Token device ID',
				required: true,
			},
			device_name: {
				type: 'string',
				description: 'Token device name',
				required: true,
			},
			user_id: {
				type: 'manyToOne',
				thisField: 'user_id',
				foreignTable: 'User',
				foreignField: 'id',
			},
		},
	},
	Post: {
		dtoProps: {
			photosIds: {
				type: 'array',
				arrayItemType: 'mongoId',
				required: true,
				example: ['507f1f77bcf86cd799439011'],
			},
		},
		dbFields: {
			id: {
				type: 'index',
			},
			text: {
				type: 'string',
				description: 'Post description',
				required: false,
			},
			location: {
				type: 'string',
				description: 'Photos location',
				required: false,
			},
			created_at: {
				type: 'createdAt',
			},
			user_id: {
				type: 'manyToOne',
				thisField: 'user_id',
				foreignTable: 'User',
				foreignField: 'id',
			},
			PostPhoto: {
				type: 'oneToMany',
			},
		},
	},
	PostPhoto: {
		dtoProps: {},
		dbFields: {
			id: {
				type: 'index',
			},
			files_ms_post_photo_id: {
				type: 'string',
				description: 'Post photo id in database of files microservice',
				required: true,
			},
			post_id: {
				type: 'manyToOne',
				thisField: 'post_id',
				foreignTable: 'Post',
				foreignField: 'id',
			},
		},
	},
} satisfies BdConfig.Root
