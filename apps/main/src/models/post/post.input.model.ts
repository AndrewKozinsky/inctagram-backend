import { DtoFieldDecorators } from '../../db/dtoFieldDecorators'
import { bdConfig } from '../../db/dbConfig/dbConfig'
import { IsIn, IsOptional, IsString } from 'class-validator'
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import { CustomException } from '../../infrastructure/exceptionFilters/customException'
import { HTTP_STATUSES } from '../../utils/httpStatuses'
import { ErrorMessage } from '@app/shared'

export class CreatePostDtoModel {
	@DtoFieldDecorators('text', bdConfig.Post.dbFields.text)
	text: string

	@DtoFieldDecorators('location', bdConfig.Post.dbFields.location)
	location: string

	@DtoFieldDecorators('location', bdConfig.Post.dbFields.location)
	photosIds: string[]
}

export class UpdatePostDtoModel {
	@DtoFieldDecorators('text', bdConfig.Post.dbFields.text)
	text: string

	@DtoFieldDecorators('location', bdConfig.Post.dbFields.location)
	location: string
}

@Injectable()
export class UploadPostImagesPipe implements PipeTransform {
	transform(files: Express.Multer.File[], metadata: ArgumentMetadata) {
		const errStatusCode = HTTP_STATUSES.BAD_REQUEST_400.toString()
		let errMessage = ''

		if (!files || !files.length) {
			throw CustomException(errStatusCode, ErrorMessage.FilesNotFound)
		}

		files.forEach((file) => {
			const maxFileSize = 10 * 1024 * 1024
			const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg']

			if (!allowedMimeTypes.includes(file.mimetype)) {
				errMessage = ErrorMessage.OneOfFilesHasWrongMimeType
			} else if (file.size > maxFileSize) {
				errMessage = ErrorMessage.OneOfFilesIsTooLarge
			}
		})

		if (errMessage) {
			throw CustomException(errStatusCode, errMessage)
		}

		return files
	}
}

/*export class EditMyProfileDtoModel {
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
}*/
