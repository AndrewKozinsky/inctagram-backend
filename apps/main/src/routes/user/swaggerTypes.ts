import { ApiProperty } from '@nestjs/swagger'

export class SWUserMeAddAvatarRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty()
	code: number

	@ApiProperty({
		type: 'object',
		properties: {
			avatarUrl: { type: 'string' },
		},
	})
	data: {
		avatarUrl: string
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
			avatarUrl: { type: 'string' },
		},
	})
	data: {
		avatarUrl: string
	}
}

export class SWEditUserProfileRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty()
	code: number

	@ApiProperty({
		type: 'object',
		properties: {
			id: { type: 'number' },
			email: { type: 'string' },
			user_name: { type: 'string' },
			first_name: { type: 'string', nullable: true },
			last_name: { type: 'string', nullable: true },
			avatar: { type: 'string', nullable: true },
			date_of_birth: { type: 'string', nullable: true },
			country_code: { type: 'string', nullable: true },
			city_id: { type: 'number', nullable: true },
			about_me: { type: 'string', nullable: true },
		},
	})
	data: {
		id: number
		email: string
		user_name: string
		first_name: null | string
		last_name: null | string
		avatar: null | string
		date_of_birth: null | string
		country_code: null | string
		city_id: null | number
		about_me: null | string
	}
}
