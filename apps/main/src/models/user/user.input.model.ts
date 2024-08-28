import { CheckByClassValidator } from '../../db/checkByClassValidator'
import { bdConfig } from '../../db/dbConfig/dbConfig'
import { Validate, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { BadRequestException, Injectable } from '@nestjs/common'
import { AuthRepository } from '../../repositories/auth.repository'
import { UserRepository } from '../../repositories/user.repository'

export class CreateUserDtoModel {
	@CheckByClassValidator('name', bdConfig.User.dbFields.name)
	name: string

	@CheckByClassValidator('password', bdConfig.User.dtoProps.password)
	password: string

	@CheckByClassValidator('email', bdConfig.User.dbFields.email)
	email: string
}

export class LoginUserDtoModel {
	@CheckByClassValidator('password', bdConfig.User.dtoProps.password)
	password: string

	@CheckByClassValidator('email', bdConfig.User.dbFields.email)
	email: string
}

@ValidatorConstraint({ name: 'code', async: true })
@Injectable()
export class CodeCustomValidation implements ValidatorConstraintInterface {
	constructor(private readonly userRepository: UserRepository) {}

	async validate(value: string): Promise<boolean> {
		const user = await this.userRepository.getUserByConfirmationCode(value)

		if (user?.isEmailConfirmed) {
			throw new BadRequestException([{ field: 'code', message: 'Email exists already' }])
		}

		if (!user) {
			throw new BadRequestException([
				{ field: 'code', message: 'Confirmation code is not exists' },
			])
		}

		return true
	}
}

export class AuthRegistrationConfirmationDtoModel {
	@CheckByClassValidator('password', bdConfig.User.dtoProps.confirmEmailCode)
	@Validate(CodeCustomValidation)
	code: string
}
