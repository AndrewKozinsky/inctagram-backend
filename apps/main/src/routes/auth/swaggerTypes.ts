import { ApiProperty } from '@nestjs/swagger'

export class SWRegistrationRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty()
	code: number

	@ApiProperty({
		type: 'object',
		properties: {
			id: { type: 'number' },
			email: { type: 'string' },
			name: { type: 'string' },
		},
	})
	data: {
		id: number
		email: string
		name: string
	}
}

export class SWAuthorizeByProviderRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty()
	code: number

	@ApiProperty({
		type: 'object',
		properties: {
			accessToken: { type: 'string' },
			user: {
				type: 'object',
				properties: {
					id: { type: 'number' },
					email: { type: 'string' },
					name: { type: 'string' },
				},
			},
		},
	})
	data: {
		accessToken: string
		user: {
			id: number
			email: string
			name: string
		}
	}
}

export class SWLoginRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty()
	code: number

	@ApiProperty({
		type: 'object',
		properties: {
			accessToken: { type: 'string' },
			user: {
				type: 'object',
				properties: {
					id: { type: 'number' },
					email: { type: 'string' },
					name: { type: 'string' },
				},
			},
		},
	})
	data: {
		accessToken: string
		user: {
			id: number
			email: string
			name: string
		}
	}
}

// DELETE
/*export class SWPasswordRecoveryRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty()
	code: number

	@ApiProperty({
		type: 'null',
	})
	data: null
}*/

export class SWGetNewAccessAndRefreshTokenRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty()
	code: number

	@ApiProperty({
		type: 'object',
		properties: {
			recoveryCode: { type: 'string' },
		},
	})
	data: {
		accessToken: string
	}
}

export class SWGetUserDevicesRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty()
	code: number

	@ApiProperty({
		type: 'array',
		items: {
			type: 'object',
			properties: {
				ip: { type: 'string' },
				title: { type: 'string' },
				lastActiveDate: { type: 'string' },
				deviceId: { type: 'string' },
			},
		},
	})
	data: {
		ip: string
		title: string
		lastActiveDate: string
		deviceId: string
	}[]
}

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
