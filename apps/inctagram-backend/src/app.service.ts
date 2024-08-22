import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MainConfigService } from '@app/config'

@Injectable()
export class AppService {
	constructor(
		private configService: ConfigService,
		private mainConfigService: MainConfigService,
	) {}

	getHello(): string {
		console.log(this.mainConfigService.get().db.host)
		// console.log(this.configService.get<string>('DATABASE_URL'))
		return 'Hello World!'
	}
}
