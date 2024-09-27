import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class MainConfigService {
	constructor(private configService: ConfigService) {}

	get() {
		return {
			mode: this.configService.get<string>('MODE'),
			site: {
				name: 'Inctagram',
				domain: 'sociable-people.com',
				domainApi: 'sociable-people.com/api/v1',
			},
			db: {
				host: this.configService.get<string>('DATABASE_URL'),
			},
			mainMicroService: {
				port:
					parseInt(this.configService.get<string>('MAIN_MICROSERVICE_PORT') || '', 10) ||
					3000,
			},
			filesMicroService: {
				port:
					parseInt(this.configService.get<string>('FILES_MICROSERVICE_PORT') || '', 10) ||
					3001,
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
			oauth: {
				github: {
					clientId: this.configService.get<string>('OAUT_GITHUB_CLIENT_ID') as string,
					clientSecret: this.configService.get<string>(
						'OAUT_GITHUB_CLIENT_SECRET',
					) as string,
				},
				google: {
					clientId: this.configService.get<string>('OAUT_GOOGLE_CLIENT_ID') as string,
					clientSecret: this.configService.get<string>(
						'OAUT_GOOGLE_CLIENT_SECRET',
					) as string,
				},
			},
			reCaptcha: {
				siteKey: this.configService.get<string>('RECAPTCHA_SITE_KEY') as string,
				serverKey: this.configService.get<string>('RECAPTCHA_SERVER_KEY') as string,
			},
		}
	}
}
