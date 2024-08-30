import { applyDecorators } from '@nestjs/common'
import { IsEmail, IsNumber, IsString, Matches, MaxLength, Min, MinLength } from 'class-validator'
import { BdConfig } from './dbConfig/dbConfigType'
import { Trim } from '../infrastructure/pipes/Trim.decorator'
import { Type } from 'class-transformer'

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
export function CheckByClassValidator(fieldName: string, fieldConf: BdConfig.Field) {
	// 'password' -> 'Password'
	const name = fieldName.charAt(0).toUpperCase() + fieldName.slice(1)

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
		}
		if (fieldConf.maxLength) {
			decorators.push(
				MaxLength(fieldConf.maxLength, {
					message: 'Maximum number of characters ' + fieldConf.maxLength,
				}),
			)
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
		}
		if (fieldConf.max) {
			decorators.push(Min(fieldConf.max, { message: 'Maximum number is ' + fieldConf.max }))
		}
	} else if (fieldConf.type === 'boolean') {
		decorators.push(Type(() => Boolean))
	}

	return applyDecorators(...decorators)
}
