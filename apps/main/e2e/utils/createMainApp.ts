import { Test, TestingModule } from '@nestjs/testing'
import { EmailAdapterService } from '@app/email-adapter'
import { Transport } from '@nestjs/microservices'
import { AppModule } from '../../src/app.module'
import { applyAppSettings } from '../../src/infrastructure/applyAppSettings'
import { GitHubService } from '../../src/routes/auth/gitHubService'
import { GoogleService } from '../../src/routes/auth/googleService'
import { ReCaptchaAdapterService } from '@app/re-captcha-adapter'
import { userEmail, userName } from './common'
import { FilesModule } from '../../../files/src/filesModule'

export async function createFilesApp() {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [FilesModule],
	}).compile()

	const filesApp = moduleFixture.createNestMicroservice({
		transport: Transport.TCP,
		options: {
			host: 'localhost',
			port: 3001,
		},
	})
	await filesApp.listen()

	return { filesApp }
}

export async function createMainApp(
	emailAdapter: EmailAdapterService,
	gitHubService: GitHubService,
	googleService: GoogleService,
	reCaptchaAdapter: ReCaptchaAdapterService,
) {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	})
		.overrideProvider(EmailAdapterService)
		.useValue({
			sendEmailConfirmationMessage: jest.fn().mockResolvedValue('Mocked Email Response'),
			sendEmail: jest.fn().mockResolvedValue('Mocked Email Response'),
			sendPasswordRecoveryMessage: jest.fn().mockResolvedValue('Mocked Email Response'),
		})
		.overrideProvider(GitHubService)
		.useValue({
			getUserDataByOAuthCode: jest.fn().mockResolvedValue({
				providerId: 1,
				name: userName,
				email: userEmail,
			}),
		})
		.overrideProvider(GoogleService)
		.useValue({
			getUserDataByOAuthCode: jest.fn().mockResolvedValue({
				providerId: 1,
				name: userName,
				email: userEmail,
			}),
		})
		.overrideProvider(ReCaptchaAdapterService)
		.useValue({
			isValid: jest.fn().mockResolvedValue(true),
		})
		.compile()

	const mainApp = moduleFixture.createNestApplication()
	applyAppSettings(mainApp)
	await mainApp.init()

	emailAdapter = moduleFixture.get<EmailAdapterService>(EmailAdapterService)
	gitHubService = moduleFixture.get<GitHubService>(GitHubService)
	googleService = moduleFixture.get<GoogleService>(GoogleService)
	reCaptchaAdapter = moduleFixture.get<ReCaptchaAdapterService>(ReCaptchaAdapterService)

	return { mainApp, emailAdapter, gitHubService, googleService, reCaptchaAdapter }
}
