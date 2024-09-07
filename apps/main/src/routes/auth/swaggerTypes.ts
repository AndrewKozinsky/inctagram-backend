import { ApiProperty } from '@nestjs/swagger'

export class SWEmptyRouteOut {
	@ApiProperty({ default: 'success' })
	status: string // 'success'

	@ApiProperty()
	code: number

	@ApiProperty({ type: 'null' })
	data: null
}

export class SWRegistrationRouteOut {
	@ApiProperty({ default: 'success' })
	status: string // 'success'

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
	status: string // 'success'

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
	status: string // 'success'

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

export class SWPasswordRecoveryRouteOut {
	@ApiProperty({ default: 'success' })
	status: string // 'success'

	@ApiProperty()
	code: number

	@ApiProperty({
		type: 'object',
		properties: {
			recoveryCode: { type: 'string' },
		},
	})
	data: {
		recoveryCode: string
	}
}

export class SWGetNewAccessAndRefreshTokenRouteOut {
	@ApiProperty({ default: 'success' })
	status: string // 'success'

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
