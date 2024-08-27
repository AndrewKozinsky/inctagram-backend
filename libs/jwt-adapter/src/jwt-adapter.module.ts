import { Global, Module } from '@nestjs/common'
import { JwtAdapterService } from './jwt-adapter.service'
import { ServerHelperModule, ServerHelperService } from '@app/server-helper'

@Global()
@Module({
	imports: [ServerHelperModule],
	providers: [JwtAdapterService, ServerHelperService],
	exports: [JwtAdapterService],
})
export class JwtAdapterModule {}
