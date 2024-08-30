import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class MainConfigService {
	constructor(private configService: ConfigService) {}

	get() {
		return {
			mode: this.configService.get<string>('MODE'),
			db: {
				host: this.configService.get<string>('DATABASE_URL'),
			},
			mainMicroService: {
				port:
					parseInt(this.configService.get<string>('MAIN_MICROSERVICE_PORT') || '', 10) ||
					3000,
			},
			refreshToken: {
				name: 'refreshToken',
				lifeDurationInMs: 1000 * 60 * 60 * 24 * 30, // 30 days
			},
			accessToken: {
				name: 'accessToken',
				lifeDurationInMs: 1000 * 60 * 30, // 30 minutes
			},
			jwt: {
				secret: 'secret',
			},
		}
	}
}
