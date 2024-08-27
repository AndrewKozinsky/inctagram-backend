import { Global, Module } from '@nestjs/common'
import { HashAdapterService } from './hash-adapter.service'

@Global()
@Module({
	providers: [HashAdapterService],
	exports: [HashAdapterService],
})
export class HashAdapterModule {}
