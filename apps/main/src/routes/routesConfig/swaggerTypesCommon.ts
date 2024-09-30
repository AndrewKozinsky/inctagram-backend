import { ApiProperty } from '@nestjs/swagger'

export class SWEmptyRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty()
	code: number

	@ApiProperty({
		type: 'string',
		nullable: true,
		example: null,
		description: 'This property can only be null.',
	})
	data: null
}
