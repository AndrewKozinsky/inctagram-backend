import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class MainConfigService {
	constructor(private configService: ConfigService) {}

	get() {
		return {
			db: {
				host: this.configService.get<string>('DATABASE_URL'),
			},
			mainMicroService: {
				port:
					parseInt(this.configService.get<string>('MAIN_MICROSERVICE_PORT') || '', 10) ||
					3000,
			},
		}
	}
}