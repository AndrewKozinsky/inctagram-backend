import { DtoFieldDecorators } from '../../db/dtoFieldDecorators'
import { bdConfig } from '../../db/dbConfig/dbConfig'
import { IsIn } from 'class-validator'
import { ArgumentMetadata, HttpStatus, Injectable, PipeTransform } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { ConfirmEmailQueries } from '../auth/auth.input.model'

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

@Injectable()
export class UploadAvatarFilePipe implements PipeTransform {
	transform(value: any, metadata: ArgumentMetadata) {
		return true
		// return value.size < 5000
	}
}
/*new ParseFilePipeBuilder()
	.addFileTypeValidator({ fileType: /(jpg|jpeg|png|webp|gif)$/ })
	.addMaxSizeValidator({ maxSize: 5000 })
	.build({
		fileIsRequired: true,
		errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
	}),*/
