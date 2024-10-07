import { ApiProperty } from '@nestjs/swagger'

export class SWRegistrationRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty({ default: 201 })
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
			avatar: { type: 'string', nullable: true },
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

export class SWAuthorizeByProviderRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty({ default: 200 })
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
					userName: { type: 'string' },
					firstName: { type: 'string', nullable: true },
					lastName: { type: 'string', nullable: true },
					dateOfBirth: { type: 'string', nullable: true },
					countryCode: { type: 'string', nullable: true },
					cityId: { type: 'number', nullable: true },
					aboutMe: { type: 'string', nullable: true },
				},
			},
		},
	})
	data: {
		accessToken: string
		user: {
			id: number
			email: string
			userName: string
			firstName: null | string
			lastName: null | string
			dateOfBirth: null | string
			countryCode: null | string
			cityId: null | number
			aboutMe: null | string
		}
	}
}

export class SWLoginRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty({ default: 200 })
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
					userName: { type: 'string' },
					firstName: { type: 'string', nullable: true },
					lastName: { type: 'string', nullable: true },
					dateOfBirth: { type: 'string', nullable: true },
					countryCode: { type: 'string', nullable: true },
					cityId: { type: 'number', nullable: true },
					aboutMe: { type: 'string', nullable: true },
					avatar: { type: 'string', nullable: true },
				},
			},
		},
	})
	data: {
		accessToken: string
		user: {
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
}

export class SWGetNewAccessAndRefreshTokenRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty({ default: 200 })
	code: number

	@ApiProperty({
		type: 'object',
		properties: {
			accessToken: { type: 'string' },
		},
	})
	data: {
		accessToken: string
	}
}
