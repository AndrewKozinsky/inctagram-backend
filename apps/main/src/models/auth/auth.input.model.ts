import { CheckByClassValidator } from '../../db/checkByClassValidator'
import { bdConfig } from '../../db/dbConfig/dbConfig'
import { Validate, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { BadRequestException, Injectable } from '@nestjs/common'
import { UserRepository } from '../../repositories/user.repository'

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

export class ConfirmEmailDtoModel {
	@CheckByClassValidator('password', bdConfig.User.dtoProps.confirmEmailCode)
	@Validate(CodeCustomValidation)
	code: string
}

export class ResendConfirmationEmailDtoModel {
	@CheckByClassValidator('password', bdConfig.User.dbFields.email)
	email: string
}

export class LoginDtoModel {
	@CheckByClassValidator('password', bdConfig.User.dtoProps.password)
	password: string

	@CheckByClassValidator('email', bdConfig.User.dbFields.email)
	email: string
}

export class PasswordRecoveryDtoModel {
	@CheckByClassValidator('password', bdConfig.User.dbFields.email)
	email: string
}
