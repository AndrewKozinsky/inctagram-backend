import { ApiProperty } from '@nestjs/swagger'

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
