import { Injectable } from '@nestjs/common'
import { MainConfigService } from '@app/config'

@Injectable()
export class ReCaptchaAdapterService {
	constructor(private mainConfig: MainConfigService) {}

	async isValid(capthaValue: string) {
		const params = new URLSearchParams({
			secret: this.mainConfig.get().reCaptcha.serverKey,
			response: capthaValue,
		}).toString()

		type CheckResultType = {
			success: boolean
			challenge_ts: string
			hostname: string
			'error-codes': string[]
		}

		const checkResult: CheckResultType = await new Promise((resolve, reject) => {
			fetch(`https://www.google.com/recaptcha/api/siteverify?${params}`, {
				method: 'POST',
			})
				.then((res) => res.json())
				.then((data) => {
					resolve(data)
				})
		})

		return checkResult.success
	}
}
