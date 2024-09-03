import { DtoFieldDecorators } from '../../db/dtoFieldDecorators'
import { bdConfig } from '../../db/dbConfig/dbConfig'

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

	@DtoFieldDecorators('recoveryCode', bdConfig.User.dtoProps.recovery_code)
	recoveryCode: string
}
