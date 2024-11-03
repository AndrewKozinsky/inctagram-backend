import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class MainConfigService {
	constructor(private configService: ConfigService) {}

	get() {
		return {
			mode: this.configService.get<string>('MODE') || '',
			site: {
				name: 'Inctagram',
				domainApi: 'main.sociable-people.com',
				domainApiWithPostfix: 'main.sociable-people.com/api/v1',
				domainRoot: 'sociable-people.com',
			},
			postgresDb: {
				host: this.configService.get<string>('POSTGRES_DB_URL') || '',
			},
			mongoDb: {
				host: this.configService.get<string>('MONGO_DB_URL') || '',
			},
			mainMicroService: {
				port: parseInt(this.configService.get<string>('MAIN_MICROSERVICE_PORT') || '0', 10),
			},
			filesMicroService: {
				port: parseInt(
					this.configService.get<string>('FILES_MICROSERVICE_PORT') || '0',
					10,
				),
			},
			// Yandex Cloud
			s3: {
				region: 'ru-central1-a',
				// Адрес сервиса Яндекса
				endpoint: 'https://storage.yandexcloud.net',
				// Ключ доступа к учётной записи
				accessKeyId: this.configService.get<string>('S3_ACCESS_KEY_ID') || '',
				// Секретный ключ доступа к учётной записи
				secretAccessKey: this.configService.get<string>('S3_SECRET_ACCESS_KEY_ID') || '',
				// Название своей корзины
				bucket: 'sociable-people',
				filesRootUrl: 'https://sociable-people.storage.yandexcloud.net',
			},
			countryStateCity: {
				apiKey: 'ajVyS0t2bjI4dzZHU3hUclA4Rjg4YUdLeDJLbkpDN2dCZnZRNDBJdA==',
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
				githubLocalToLocal: {
					clientId:
						this.configService.get<string>('OAUT_GITHUB_CLIENT_ID_LOCAL_TO_LOCAL') ||
						'',
					clientSecret:
						this.configService.get<string>(
							'OAUT_GITHUB_CLIENT_SECRET_LOCAL_TO_LOCAL',
						) || '',
				},
				githubProdToProd: {
					clientId:
						this.configService.get<string>('OAUT_GITHUB_CLIENT_ID_PROD_TO_PROD') || '',
					clientSecret:
						this.configService.get<string>('OAUT_GITHUB_CLIENT_SECRET_PROD_TO_PROD') ||
						'',
				},
				google: {
					clientId: this.configService.get<string>('OAUT_GOOGLE_CLIENT_ID') as string,
					clientSecret: this.configService.get<string>('OAUT_GOOGLE_CLIENT_SECRET') || '',
				},
			},
			reCaptcha: {
				siteKey: this.configService.get<string>('RECAPTCHA_SITE_KEY') || '',
				serverKey: this.configService.get<string>('RECAPTCHA_SERVER_KEY') || '',
			},
		}
	}
}
