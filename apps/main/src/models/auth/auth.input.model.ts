import { DtoFieldDecorators } from '../../db/dtoFieldDecorators'
import { bdConfig } from '../../db/dbConfig/dbConfig'
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'

export class ConfirmEmailQueries {
	@DtoFieldDecorators('code', bdConfig.User.dbFields.email_confirmation_code, { required: true })
	code: string
}

@Injectable()
export class GetBlogsQueriesPipe implements PipeTransform {
	async transform(dto: ConfirmEmailQueries, { metatype }: ArgumentMetadata) {
		if (!metatype) {
			return dto
		}

		return plainToInstance(metatype, dto)
	}
}

export class ResendConfirmationEmailDtoModel {
	@DtoFieldDecorators('email', bdConfig.User.dbFields.email)
	email: string
}

export class LoginDtoModel {
	@DtoFieldDecorators('password', bdConfig.User.dtoProps.password)
	password: string

	@DtoFieldDecorators('email', bdConfig.User.dbFields.email)
	email: string
}

export class PasswordRecoveryDtoModel {
	@DtoFieldDecorators('email', bdConfig.User.dbFields.email)
	email: string
}
