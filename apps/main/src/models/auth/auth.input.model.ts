import { DtoFieldDecorators } from '../../db/dtoFieldDecorators'
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
	@DtoFieldDecorators('password', bdConfig.User.dbFields.emailConfirmationCode)
	@Validate(CodeCustomValidation)
	code: string
}

export class ResendConfirmationEmailDtoModel {
	@DtoFieldDecorators('password', bdConfig.User.dbFields.email)
	email: string
}

export class LoginDtoModel {
	@DtoFieldDecorators('password', bdConfig.User.dtoProps.password)
	password: string

	@DtoFieldDecorators('email', bdConfig.User.dbFields.email)
	email: string
}

export class PasswordRecoveryDtoModel {
	@DtoFieldDecorators('password', bdConfig.User.dbFields.email)
	email: string
}
