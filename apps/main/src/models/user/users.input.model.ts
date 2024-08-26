import { userTable } from '../tableFieldCheckers/userTable'

const { CheckNameField, CheckPasswordField, CheckEmailField } = userTable

export class CreateUserDtoModel {
	@CheckNameField()
	name: string

	@CheckPasswordField()
	password: string

	@CheckEmailField()
	email: string
}

// ---

const bdConfig = {
	user: {
		fields: {
			id: {
				type: 'index',
			},
			name: {
				type: 'string',
				minLength: 6,
				maxLength: 30,
				match: /^[A-Za-z0-9_-]+$/,
				matchErrorMessage:
					'Password must contain only letters, numbers and !"#$%&\'()*+,\\-./:;<=>?@[\\\\\\]^_{|}~ symbols',
			},
		},
	},
}
