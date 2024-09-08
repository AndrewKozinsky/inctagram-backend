import { Module } from '@nestjs/common'
import { MainConfigModule } from '@app/config'
import { AuthModule } from './routes/auth/auth.module'
import { ServerHelperModule } from '@app/server-helper'
import { EmailAdapterModule } from '@app/email-adapter'
import { HashAdapterModule } from '@app/hash-adapter'
import { BrowserServiceModule } from '@app/browser-service'
import { TestsModule } from './routes/test/tests.module'
import { AuthService } from './routes/auth/auth.service'
import { ReCaptchaAdapterModule } from '@app/re-captcha-adapter'

@Module({
	imports: [
		MainConfigModule,
		ServerHelperModule,
		EmailAdapterModule,
		HashAdapterModule,
		BrowserServiceModule,
		ReCaptchaAdapterModule,
		TestsModule,
		AuthModule,
	],
	controllers: [],
	providers: [AuthService],
})
export class AppModule {}
