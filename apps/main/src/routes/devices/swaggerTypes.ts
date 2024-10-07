import { ApiProperty } from '@nestjs/swagger'

export class SWGetUserDevicesRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty({ default: 200 })
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
