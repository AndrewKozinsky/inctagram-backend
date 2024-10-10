import { ApiProperty } from '@nestjs/swagger'

export class SWAddPostRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty()
	code: number

	@ApiProperty({
		type: 'object',
		properties: {
			id: {
				type: 'number',
				default: 1,
			},
			text: {
				type: 'string',
				default: 'Images of clouded roses and angry green eyes flow through my dreams.',
				nullable: true,
			},
			location: {
				type: 'string',
				default: 'Rostov-on-Don, 47.265223, 39.595245',
				nullable: true,
			},
			userId: {
				type: 'number',
				default: 1,
			},
			photos: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						id: { type: 'number' },
						url: {
							type: 'number',
							default:
								'https://storage.yandexcloud.net/sociable-people/users/100/avatar.png',
						},
					},
				},
			},
		},
	})
	data: {
		id: number
		text: null | string
		location: null | string
		userId: number
		photos: {
			id: number
			url: string
		}[]
	}
}

export class SWGetPostRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty()
	code: number

	@ApiProperty({
		type: 'object',
		nullable: true,
		properties: {
			id: {
				type: 'number',
				default: 1,
			},
			text: {
				type: 'string',
				default: 'Images of clouded roses and angry green eyes flow through my dreams.',
				nullable: true,
			},
			location: {
				type: 'string',
				default: 'Rostov-on-Don, 47.265223, 39.595245',
				nullable: true,
			},
			userId: {
				type: 'number',
				default: 1,
			},
			photos: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						id: { type: 'number' },
						url: {
							type: 'number',
							default:
								'https://storage.yandexcloud.net/sociable-people/users/100/avatar.png',
						},
					},
				},
			},
		},
	})
	data: null | {
		id: number
		text: null | string
		location: null | string
		userId: number
		photos: {
			id: number
			url: string
		}[]
	}
}

export class SWUpdatePostRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty()
	code: number

	@ApiProperty({
		type: 'object',
		properties: {
			id: {
				type: 'number',
				default: 1,
			},
			text: {
				type: 'string',
				default: 'Images of clouded roses and angry green eyes flow through my dreams.',
				nullable: true,
			},
			location: {
				type: 'string',
				default: 'Rostov-on-Don, 47.265223, 39.595245',
				nullable: true,
			},
			userId: {
				type: 'number',
				default: 1,
			},
			photos: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						id: { type: 'number' },
						url: {
							type: 'number',
							default:
								'https://storage.yandexcloud.net/sociable-people/users/100/avatar.png',
						},
					},
				},
			},
		},
	})
	data: {
		id: number
		text: null | string
		location: null | string
		userId: number
		photos: {
			id: number
			url: string
		}[]
	}
}
