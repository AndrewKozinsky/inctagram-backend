export const bdConfig = {
	user: {
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
			},
			passwordRecoveryCode: {
				type: 'string',
				required: false,
			},
		},
	},
} satisfies BdConfig.Root

export namespace BdConfig {
	export type Root = Record<string, Table>

	export type Table = {
		dtoProps: Record<string, Field>
		dbFields: Record<string, Field>
	}

	export type Field = IndexField | StringField | BooleanField | EmailField

	export type IndexField = {
		type: 'index'
	}

	export type StringField = {
		type: 'string'
		required?: boolean
		unique?: boolean
		minLength?: number
		maxLength?: number
		match?: RegExp
		matchErrorMessage?: string
	}

	export type BooleanField = {
		type: 'boolean'
		required?: boolean
	}

	export type EmailField = {
		type: 'email'
		required?: boolean
		unique?: boolean
	}
}
