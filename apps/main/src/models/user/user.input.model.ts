import { CheckByClassValidator } from '../../db/checkByClassValidator'
import { bdConfig } from '../../db/dbConfig/dbConfig'

export class CreateUserDtoModel {
	@CheckByClassValidator('name', bdConfig.User.dbFields.name)
	name: string

	@CheckByClassValidator('password', bdConfig.User.dtoProps.password)
	password: string

	@CheckByClassValidator('email', bdConfig.User.dbFields.email)
	email: string
}

export class SetNewPasswordDtoModel {
	@CheckByClassValidator('password', bdConfig.User.dtoProps.password)
	newPassword: string

	@CheckByClassValidator('password', bdConfig.User.dtoProps.recoveryCode)
	recoveryCode: string
}
