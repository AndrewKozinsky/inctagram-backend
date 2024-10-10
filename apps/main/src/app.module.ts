import { Module } from '@nestjs/common'
import { MainConfigModule } from '@app/config'
import { AuthModule } from './routes/auth/auth.module'
import { SharedModule } from '@app/shared'
import { EmailAdapterModule } from '@app/email-adapter'
import { HashAdapterModule } from '@app/hash-adapter'
import { BrowserServiceModule } from '@app/browser-service'
import { TestsModule } from './routes/test/tests.module'
import { AuthService } from './routes/auth/auth.service'
import { ReCaptchaAdapterModule } from '@app/re-captcha-adapter'
import { DevicesModule } from './routes/devices/devices.module'
import { UserModule } from './routes/user/user.module'
import { GeoModule } from './routes/geo/geo.module'
import { PostModule } from './routes/post/post.module'

@Module({
	imports: [
		MainConfigModule,
		SharedModule,
		EmailAdapterModule,
		HashAdapterModule,
		BrowserServiceModule,
		ReCaptchaAdapterModule,
		TestsModule,
		AuthModule,
		DevicesModule,
		UserModule,
		GeoModule,
		PostModule,
	],
	controllers: [],
	providers: [AuthService],
})
export class AppModule {}
