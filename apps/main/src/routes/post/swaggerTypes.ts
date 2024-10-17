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
							type: 'string',
							default:
								'https://storage.yandexcloud.net/sociable-people/users/100/posts/photo.png',
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
							type: 'string',
							default:
								'https://storage.yandexcloud.net/sociable-people/users/100/posts/photo.png',
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
							type: 'string',
							default:
								'https://storage.yandexcloud.net/sociable-people/users/100/posts/photo.png',
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

export class SWGetRecentPostRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty()
	code: number

	@ApiProperty({
		type: 'array',
		items: {
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
				user: {
					type: 'object',
					properties: {
						id: {
							type: 'number',
							default: 1,
						},
						name: {
							type: 'string',
							example: 'AndrewKozinsky',
						},
						avatar: {
							type: 'string',
							example:
								'https://sociable-people.storage.yandexcloud.net/users/1/avatar.png',
							nullable: true,
						},
					},
				},
				photos: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							id: { type: 'number' },
							url: {
								type: 'string',
								default:
									'https://storage.yandexcloud.net/sociable-people/users/100/posts/photo.png',
							},
						},
					},
				},
			},
		},
	})
	data: {
		id: number
		text: string
		createdAt: string
		user: { id: number; name: string; avatar: null | string }
		photos: { id: number; url: string }[]
	}[]
}
