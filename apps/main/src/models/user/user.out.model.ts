import { ApiProperty } from '@nestjs/swagger'

export class UserOutModel {
	@ApiProperty()
	id: number

	@ApiProperty()
	email: string

	@ApiProperty()
	name: string
}
