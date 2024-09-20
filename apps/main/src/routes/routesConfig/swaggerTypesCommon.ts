import { ApiProperty } from '@nestjs/swagger'

export class SWEmptyRouteOut {
	@ApiProperty({ default: 'success' })
	status: string

	@ApiProperty()
	code: number

	@ApiProperty({ type: 'string', nullable: true })
	data: null
}
