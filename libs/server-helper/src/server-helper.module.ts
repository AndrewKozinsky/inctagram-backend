import { Global, Module } from '@nestjs/common'
import { ServerHelperService } from './server-helper.service'

@Global()
@Module({
	providers: [ServerHelperService],
	exports: [ServerHelperService],
})
export class ServerHelperModule {}
