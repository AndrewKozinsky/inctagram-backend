import { applyDecorators } from '@nestjs/common'
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator'
import { BdConfig } from './dbConfig'

export function CheckByClassValidator(fieldName: string, fieldConf: BdConfig.Field) {
	// 'password' -> 'Password'
	const name = fieldName.charAt(0).toUpperCase() + fieldName.slice(1)

	const decorators: any[] = [IsString, MinLength]

	if (fieldConf.type === 'string') {
		decorators.push(IsString({ message: name + ' must be a string' }))

		if (fieldConf.minLength) {
			decorators.push(MinLength(fieldConf.minLength, { message: name + ' is too short' }))
		}
		if (fieldConf.maxLength) {
			decorators.push(MaxLength(fieldConf.maxLength, { message: name + ' is too long' }))
		}
		if (fieldConf.match) {
			if (fieldConf.matchErrorMessage) {
				decorators.push(Matches(fieldConf.match, { message: fieldConf.matchErrorMessage }))
			} else {
				decorators.push(Matches(fieldConf.match, { message: name + ' does not match' }))
			}
		}
	} else if (fieldConf.type === 'email') {
		decorators.push(IsString({ message: name + ' must be a string' }))
		decorators.push(IsEmail({}, { message: name + ' must be email' }))
	}

	return applyDecorators(...decorators)
}
