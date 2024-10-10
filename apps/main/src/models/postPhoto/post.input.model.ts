import { DtoFieldDecorators } from '../../db/dtoFieldDecorators'
import { bdConfig } from '../../db/dbConfig/dbConfig'
import { IsIn, IsOptional, IsString } from 'class-validator'
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import { CustomException } from '../../infrastructure/exceptionFilters/customException'
import { HTTP_STATUSES } from '../../utils/httpStatuses'
import { ErrorMessage } from '@app/shared'

/*export class CreatePostDtoModel {
	@DtoFieldDecorators('text', bdConfig.Post.dbFields.text)
	text: string

	@DtoFieldDecorators('location', bdConfig.Post.dbFields.location)
	location: string

	@IsString()
	@IsOptional()
	photoFiles: any
}*/

/*@Injectable()
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
}*/
