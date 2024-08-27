import { Global, Module } from '@nestjs/common'
import { EmailAdapterService } from './email-adapter.service'

@Global()
@Module({
	providers: [EmailAdapterService],
	exports: [EmailAdapterService],
})
export class EmailAdapterModule {}
