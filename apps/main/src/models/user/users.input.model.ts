import { CheckByClassValidator } from '../../db/checkByClassValidator'
import { bdConfig } from '../../db/dbConfig'

export class CreateUserDtoModel {
	@CheckByClassValidator('name', bdConfig.user.dbFields.name)
	name: string

	@CheckByClassValidator('password', bdConfig.user.dtoProps.password)
	password: string

	@CheckByClassValidator('email', bdConfig.user.dbFields.email)
	email: string
}
