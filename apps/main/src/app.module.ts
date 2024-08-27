import { Module } from '@nestjs/common'
import { MainConfigModule } from '@app/config'
import { AuthModule } from './routes/auth/auth.module'
import { ServerHelperModule } from '@app/server-helper'
import { EmailAdapterModule } from '@app/email-adapter'
import { HashAdapterModule } from '@app/hash-adapter'
import { BrowserServiceModule } from '@app/browser-service'

@Module({
	imports: [
		MainConfigModule,
		ServerHelperModule,
		EmailAdapterModule,
		HashAdapterModule,
		BrowserServiceModule,
		AuthModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
