import { applyDecorators } from '@nestjs/common'
import {
	IsEmail,
	IsMimeType,
	IsNumber,
	IsOptional,
	IsString,
	Matches,
	MaxLength,
	Min,
	MinLength,
} from 'class-validator'
import { BdConfig } from './dbConfig/dbConfigType'
import { Trim } from '../infrastructure/pipes/Trim.decorator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger'

// @IsIn(['desc', 'asc'])
// @IsEnum(LikeStatuses)
// @IsArray({ message: 'CorrectAnswers must be an array of strings' })
// @ArrayMinSize(1)

/**
 * Creates universal decorator to check property in DTO for compliance with fieldConf
 * @param fieldName
 * @param fieldConf
 * @param rewrittenConfigFields
 */
export function DtoFieldDecorators(
	fieldName: string,
	fieldConf: BdConfig.Field,
	rewrittenConfigFields: Partial<BdConfig.Field> = {},
) {
	const updatedFieldConf = Object.assign(fieldConf, rewrittenConfigFields)

	// 'password' -> 'Password'
	const name = fieldName.charAt(0).toUpperCase() + fieldName.slice(1)

	const apiPropertyOptions = createApiPropertyOptions(updatedFieldConf)

	const decorators: any[] = []

	if (updatedFieldConf.type === 'string') {
		decorators.push(IsString({ message: name + ' must be a string' }))
		decorators.push(Trim())

		if (updatedFieldConf.minLength) {
			decorators.push(
				MinLength(updatedFieldConf.minLength, {
					message: 'Minimum number of characters ' + updatedFieldConf.minLength,
				}),
			)

			apiPropertyOptions.minLength = updatedFieldConf.minLength
		}

		if (updatedFieldConf.maxLength) {
			decorators.push(
				MaxLength(updatedFieldConf.maxLength, {
					message: 'Maximum number of characters ' + updatedFieldConf.maxLength,
				}),
			)

			apiPropertyOptions.maxLength = updatedFieldConf.maxLength
		}

		if (updatedFieldConf.match) {
			const errMessage = updatedFieldConf.matchErrorMessage
				? updatedFieldConf.matchErrorMessage
				: name + ' does not match'

			decorators.push(Matches(updatedFieldConf.match, { message: errMessage }))
		}

		if (!updatedFieldConf.required) {
			decorators.push(IsOptional())
		}
	} else if (updatedFieldConf.type === 'email') {
		decorators.push(IsString({ message: name + ' must be a string' }))
		decorators.push(
			IsEmail({}, { message: 'The email must match the format example@example.com' }),
		)
		if (!updatedFieldConf.required) {
			decorators.push(IsOptional())
		}
	} else if (updatedFieldConf.type === 'number') {
		// @Type(() => Number)
		decorators.push(IsNumber)

		if (updatedFieldConf.min) {
			decorators.push(
				Min(updatedFieldConf.min, { message: 'Minimum number is ' + updatedFieldConf.min }),
			)

			apiPropertyOptions.minimum = updatedFieldConf.min
		}
		if (updatedFieldConf.max) {
			decorators.push(
				Min(updatedFieldConf.max, { message: 'Maximum number is ' + updatedFieldConf.max }),
			)

			apiPropertyOptions.maximum = updatedFieldConf.max
		}
		if (!updatedFieldConf.required) {
			decorators.push(IsOptional())
		}
	} else if (updatedFieldConf.type === 'boolean') {
		decorators.push(Type(() => Boolean))
		if (!updatedFieldConf.required) {
			decorators.push(IsOptional())
		}
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
