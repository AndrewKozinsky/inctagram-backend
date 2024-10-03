import { ApiProperty } from '@nestjs/swagger'

export class UserOutModel {
	@ApiProperty({ type: 'number' })
	id: number
	@ApiProperty({ type: 'string' })
	email: string

	@ApiProperty({ type: 'string' })
	userName: string

	@ApiProperty({ type: 'string', nullable: true })
	firstName: null | string

	@ApiProperty({ type: 'string', nullable: true })
	lastName: null | string

	@ApiProperty({ type: 'string', nullable: true })
	dateOfBirth: null | string

	@ApiProperty({ type: 'string', nullable: true })
	countryCode: null | string

	@ApiProperty({ type: 'number', nullable: true })
	cityId: null | number

	@ApiProperty({ type: 'string', nullable: true })
	aboutMe: null | string

	@ApiProperty({ type: 'string', nullable: true })
	avatar: null | string
}
