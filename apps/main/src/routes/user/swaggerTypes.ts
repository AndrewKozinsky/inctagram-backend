import { ApiProperty } from '@nestjs/swagger'

export class SWGetAllUsersRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty({ default: 200 })
	code: number

	@ApiProperty({
		type: 'object',
		properties: {
			totalCount: {
				type: 'number',
				default: 41,
			},
		},
	})
	data: {
		totalCount: number
	}
}

export class SWUserMeAddAvatarRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty()
	code: number

	@ApiProperty({
		type: 'object',
		properties: {
			avatarUrl: {
				type: 'string',
				default: 'https://storage.yandexcloud.net/sociable-people/users/100/avatar.png',
				nullable: true,
			},
		},
	})
	data: {
		avatarUrl: null | string
	}
}

export class SWUserMeGetAvatarRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty()
	code: number

	@ApiProperty({
		type: 'object',
		properties: {
			avatarUrl: {
				type: 'string',
				default: 'https://storage.yandexcloud.net/sociable-people/users/100/avatar.png',
				nullable: true,
			},
		},
	})
	data: {
		avatarUrl: string
	}
}

export class SWUserProfileRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty()
	code: number

	@ApiProperty({
		type: 'object',
		properties: {
			id: { type: 'number' },
			email: { type: 'string' },
			userName: { type: 'string' },
			firstName: { type: 'string', nullable: true },
			lastName: { type: 'string', nullable: true },
			dateOfBirth: { type: 'string', nullable: true },
			countryCode: { type: 'string', nullable: true },
			cityId: { type: 'number', nullable: true },
			aboutMe: { type: 'string', nullable: true },
			avatar: {
				type: 'string',
				default: 'https://storage.yandexcloud.net/sociable-people/users/100/avatar.png',
				nullable: true,
			},
		},
	})
	data: {
		id: number
		email: string
		userName: string
		firstName: null | string
		lastName: null | string
		dateOfBirth: null | string
		countryCode: null | string
		cityId: null | number
		aboutMe: null | string
		avatar: null | string
	}
}

export class SWGetUserPostsRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty({ default: 200 })
	code: number

	@ApiProperty({
		type: 'object',
		properties: {
			pagesCount: {
				type: 'number',
				default: 7,
			},
			page: {
				type: 'number',
				default: 1,
			},
			pageSize: {
				type: 'number',
				default: 10,
			},
			totalCount: {
				type: 'number',
				default: 10,
			},
			items: {
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
							default:
								'Images of clouded roses and angry green eyes flow through my dreams.',
							nullable: true,
						},
						location: {
							type: 'string',
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
									id: { type: 'number', default: 10 },
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
			},
		},
	})
	data: {
		pagesCount: number
		page: number
		pageSize: number
		totalCount: number
		items: {
			id: number
			text: null | string
			location: null | string
			userId: number
			photos: { id: number; url: string }[]
		}[]
	}
}
