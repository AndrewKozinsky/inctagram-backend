import { ApiProperty } from '@nestjs/swagger'

export class SWGetCountriesRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty()
	code: number

	@ApiProperty({
		type: 'object',
		properties: {
			countries: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						code: { type: 'string' },
						name: { type: 'string' },
					},
				},
			},
		},
	})
	data: {
		countries: { code: string; name: string }[]
	}
}

export class SWGetCountryCitiesRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty()
	code: number

	@ApiProperty({
		type: 'object',
		properties: {
			countries: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						id: { type: 'number' },
						name: { type: 'string' },
					},
				},
			},
		},
	})
	data: {
		cities: { id: number; name: string }[]
	}
}

export class SWGetCityRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty()
	code: number

	@ApiProperty({
		type: 'object',
		nullable: true,
		properties: {
			name: { type: 'string' },
		},
	})
	data: {
		id: number
		name: string
	} | null
}
