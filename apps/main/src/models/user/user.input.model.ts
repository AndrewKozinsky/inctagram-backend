import { DtoFieldDecorators } from '../../db/dtoFieldDecorators'
import { bdConfig } from '../../db/dbConfig/dbConfig'
import { IsIn } from 'class-validator'

export class CreateUserDtoModel {
	@DtoFieldDecorators('name', bdConfig.User.dbFields.name)
	name: string

	@DtoFieldDecorators('password', bdConfig.User.dtoProps.password)
	password: string

	@DtoFieldDecorators('email', bdConfig.User.dbFields.email)
	email: string
}

export class SetNewPasswordDtoModel {
	@DtoFieldDecorators('newPassword', bdConfig.User.dtoProps.password)
	newPassword: string

	@DtoFieldDecorators('recoveryCode', bdConfig.User.dtoProps.recoveryCode)
	recoveryCode: string
}

export type OAuthProviderName = 'github' | 'google'

export class ProviderNameQueryModel {
	@IsIn(['github', 'google'], { message: 'Provider must be either github or google' })
	provider: OAuthProviderName
}
