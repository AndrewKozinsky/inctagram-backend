import { Global, Module } from '@nestjs/common'
import { JwtAdapterService } from './jwt-adapter.service'
import { ServerHelperModule } from '@app/server-helper'

@Global()
@Module({
	imports: [ServerHelperModule],
	providers: [JwtAdapterService],
	exports: [JwtAdapterService],
})
export class JwtAdapterModule {}
