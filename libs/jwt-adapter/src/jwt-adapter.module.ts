import { Global, Module } from '@nestjs/common'
import { JwtAdapterService } from './jwt-adapter.service'
import { SharedModule } from '@app/shared'

@Global()
@Module({
	imports: [SharedModule],
	providers: [JwtAdapterService],
	exports: [JwtAdapterService],
})
export class JwtAdapterModule {}
