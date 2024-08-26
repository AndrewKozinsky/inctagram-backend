import { applyDecorators } from '@nestjs/common'
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export const userTable = {
	CheckNameField() {
		return applyDecorators(
			IsString({ message: 'Name must be a string' }),
			MinLength(6, { message: 'Name is too short' }),
			MaxLength(30, { message: 'Name is too long' }),
			Matches(/^[a-zA-Z0-9_-]*$/, {
				message: 'Name must have only letters, numbers and _ ; - symbols',
			}),
		)
	},
	CheckPasswordField() {
		return applyDecorators(
			IsString({ message: 'Password must be a string' }),
			MinLength(6, { message: 'Password is too short' }),
			MaxLength(20, { message: 'Password is too long' }),
			Matches(/[0-9A-Za-z!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/, {
				message:
					'Password must contain only letters, numbers and !"#$%&\'()*+,\\-./:;<=>?@[\\\\\\]^_{|}~ symbols',
			}),
		)
	},
	CheckEmailField() {
		return applyDecorators(IsString({ message: 'Email must be a string' }), IsEmail())
	},
}
