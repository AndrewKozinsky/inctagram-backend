import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class MainConfigService {
	constructor(private configService: ConfigService) {}

	get() {
		return {
			db: {
				host: this.configService.get<string>('DATABASE_URL'),
				port: parseInt(this.configService.get<string>('PORT'), 10) || 5432,
			},
		}
	}
}
