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

export class LoginUserDtoModel {
	@CheckByClassValidator('password', bdConfig.User.dtoProps.password)
	password: string

	@CheckByClassValidator('email', bdConfig.User.dbFields.email)
	email: string
}
