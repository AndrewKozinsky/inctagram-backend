import { ApiProperty } from '@nestjs/swagger'

export class UserOutModel {
	@ApiProperty({ type: 'number' })
	id: number
	@ApiProperty({ type: 'string' })
	email: string
	@ApiProperty({ type: 'string' })
	name: string
}
