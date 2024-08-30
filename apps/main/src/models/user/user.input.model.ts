import { DtoFieldDecorators } from '../../db/dtoFieldDecorators'
import { bdConfig } from '../../db/dbConfig/dbConfig'
import { ApiProperty } from '@nestjs/swagger'

export class CreateUserDtoModel {
	@DtoFieldDecorators('name', bdConfig.User.dbFields.name)
	name: string

	@DtoFieldDecorators('password', bdConfig.User.dtoProps.password)
	password: string

	@DtoFieldDecorators('email', bdConfig.User.dbFields.email)
	email: string
}

export class SetNewPasswordDtoModel {
	@DtoFieldDecorators('password', bdConfig.User.dtoProps.password)
	newPassword: string

	@DtoFieldDecorators('password', bdConfig.User.dtoProps.recoveryCode)
	recoveryCode: string
}
