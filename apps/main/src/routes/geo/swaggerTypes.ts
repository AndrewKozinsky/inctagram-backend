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
			cities: {
				type: 'array',
				nullable: true,
				items: {
					type: 'object',
					properties: {
						id: { type: 'number' },
						name: { type: 'string' },
					},
				},
			},
			total: { type: 'number' },
		},
	})
	data: {
		cities: { id: number; name: string }[] | null
		total: number
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
			id: { type: 'number' },
			name: { type: 'string' },
		},
	})
	data: {
		id: number
		name: string
	} | null
}
