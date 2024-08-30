import { applyDecorators } from '@nestjs/common'
import { IsEmail, IsNumber, IsString, Matches, MaxLength, Min, MinLength } from 'class-validator'
import { BdConfig } from './dbConfig/dbConfigType'
import { Trim } from '../infrastructure/pipes/Trim.decorator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger'

// @IsOptional()
// @IsIn(['desc', 'asc'])
// @IsEnum(LikeStatuses)
// @IsArray({ message: 'CorrectAnswers must be an array of strings' })
// @ArrayMinSize(1)

/**
 * Creates universal decorator to check property in DTO for compliance with fieldConf
 * @param fieldName
 * @param fieldConf
 */
export function DtoFieldDecorators(fieldName: string, fieldConf: BdConfig.Field) {
	// 'password' -> 'Password'
	const name = fieldName.charAt(0).toUpperCase() + fieldName.slice(1)

	const apiPropertyOptions = createApiPropertyOptions(fieldConf)

	const decorators: any[] = []

	if (fieldConf.type === 'string') {
		decorators.push(IsString({ message: name + ' must be a string' }))
		decorators.push(Trim())

		if (fieldConf.minLength) {
			decorators.push(
				MinLength(fieldConf.minLength, {
					message: 'Minimum number of characters ' + fieldConf.minLength,
				}),
			)

			apiPropertyOptions.minLength = fieldConf.minLength
		}

		if (fieldConf.maxLength) {
			decorators.push(
				MaxLength(fieldConf.maxLength, {
					message: 'Maximum number of characters ' + fieldConf.maxLength,
				}),
			)

			apiPropertyOptions.maxLength = fieldConf.maxLength
		}

		if (fieldConf.match) {
			const errMessage = fieldConf.matchErrorMessage
				? fieldConf.matchErrorMessage
				: name + ' does not match'

			decorators.push(Matches(fieldConf.match, { message: errMessage }))
		}
	} else if (fieldConf.type === 'email') {
		decorators.push(IsString({ message: name + ' must be a string' }))
		decorators.push(
			IsEmail({}, { message: 'The email must match the format example@example.com' }),
		)
	} else if (fieldConf.type === 'number') {
		// @Type(() => Number)
		decorators.push(IsNumber)

		if (fieldConf.min) {
			decorators.push(Min(fieldConf.min, { message: 'Minimum number is ' + fieldConf.min }))

			apiPropertyOptions.minimum = fieldConf.min
		}
		if (fieldConf.max) {
			decorators.push(Min(fieldConf.max, { message: 'Maximum number is ' + fieldConf.max }))

			apiPropertyOptions.maximum = fieldConf.max
		}
	} else if (fieldConf.type === 'boolean') {
		decorators.push(Type(() => Boolean))
	}

	decorators.push(ApiProperty(apiPropertyOptions))

	return applyDecorators(...decorators)
}

function createApiPropertyOptions(fieldConf: BdConfig.Field) {
	const apiPropertyOptions: ApiPropertyOptions = {}

	if ('description' in fieldConf) {
		apiPropertyOptions.description = fieldConf.description
	}

	if ('required' in fieldConf) {
		apiPropertyOptions.required = fieldConf.required === false ? false : true
	}

	if ('default' in fieldConf) {
		apiPropertyOptions.default = fieldConf.default
	}

	if (fieldConf.type === 'email') {
		apiPropertyOptions.example = 'email@example.com'
	}

	if ('example' in fieldConf) {
		apiPropertyOptions.example = fieldConf.example
	}

	return apiPropertyOptions
}
