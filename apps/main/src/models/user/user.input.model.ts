import { DtoFieldDecorators } from '../../db/dtoFieldDecorators'
import { bdConfig } from '../../db/dbConfig/dbConfig'
import { IsIn } from 'class-validator'
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import { CustomException } from '../../infrastructure/exceptionFilters/customException'
import { HTTP_STATUSES } from '../../utils/httpStatuses'
import { ErrorMessage } from '@app/shared'

export class CreateUserDtoModel {
	@DtoFieldDecorators('user_name', bdConfig.User.dbFields.user_name)
	userName: string

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
	transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
		const maxFileSize = 10 * 1024 * 1024
		// const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp', 'image/gif']
		const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg']

		const errStatusCode = HTTP_STATUSES.BAD_REQUEST_400.toString()
		let errMessage = ''

		if (!file) {
			errMessage = ErrorMessage.FileNotFound
		} else if (!allowedMimeTypes.includes(file.mimetype)) {
			errMessage = ErrorMessage.FileHasWrongMimeType
		} else if (file.size > maxFileSize) {
			errMessage = ErrorMessage.FileIsTooLarge
		}

		if (errMessage) {
			throw CustomException(errStatusCode, errMessage)
		}

		return file
	}
}

export class EditMyProfileDtoModel {
	@DtoFieldDecorators('userName', bdConfig.User.dbFields.user_name)
	userName: string

	@DtoFieldDecorators('firstName', bdConfig.User.dbFields.first_name)
	firstName: null | string

	@DtoFieldDecorators('lastName', bdConfig.User.dbFields.last_name)
	lastName: null | string

	@DtoFieldDecorators('dateOfBirth', bdConfig.User.dbFields.date_of_birth)
	dateOfBirth: null | string

	@DtoFieldDecorators('countryCode', bdConfig.User.dbFields.country_code)
	countryCode: null | string

	@DtoFieldDecorators('cityId', bdConfig.User.dbFields.city_id)
	cityId: null | number

	@DtoFieldDecorators('aboutMe', bdConfig.User.dbFields.about_me)
	aboutMe: null | string
}
