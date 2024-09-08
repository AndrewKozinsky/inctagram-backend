import { Global, Module } from '@nestjs/common'
import { ReCaptchaAdapterService } from './re-captcha-adapter.service'

@Global()
@Module({
	providers: [ReCaptchaAdapterService],
	exports: [ReCaptchaAdapterService],
})
export class ReCaptchaAdapterModule {}
