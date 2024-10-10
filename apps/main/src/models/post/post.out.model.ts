import { ApiProperty } from '@nestjs/swagger'

export class PostOutModel {
	@ApiProperty({ type: 'number' })
	id: number

	@ApiProperty({ type: 'string', nullable: true })
	text: null | string

	@ApiProperty({ type: 'string', nullable: true })
	location: null | string

	@ApiProperty({ type: 'number' })
	userId: number

	@ApiProperty({
		type: 'array',
		items: {
			type: 'object',
			properties: {
				id: { type: 'number' },
				url: { type: 'string' },
			},
		},
	})
	photos: {
		id: number
		url: string
	}[]
}
