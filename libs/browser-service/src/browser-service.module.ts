import { Global, Module } from '@nestjs/common'
import { BrowserServiceService } from './browser-service.service'

@Global()
@Module({
	providers: [BrowserServiceService],
	exports: [BrowserServiceService],
})
export class BrowserServiceModule {}
