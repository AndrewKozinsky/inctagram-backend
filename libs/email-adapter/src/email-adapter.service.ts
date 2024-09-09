import { Injectable } from '@nestjs/common'
import { MainConfigService } from '@app/config'
const sendpulse = require('sendpulse-api')

@Injectable()
export class EmailAdapterService {
	constructor(private mainConfig: MainConfigService) {}

	async sendEmailConfirmationMessage(userEmail: string, confirmationCode: string) {
		const siteName = this.mainConfig.get().site.name
		const domain = this.mainConfig.get().site.domain

		const subject = 'Registration at ' + siteName
		const textMessage = 'Registration at ' + siteName
		const htmlMessage = `
<h1>Thanks for your registration</h1>
<p>To finish registration please confirm your email by follow the link below:
	<a href='https://${domain}/auth/email-confirmation?code=${confirmationCode}'>confirm email</a>
</p>
<p>
	<a href="https://${domain}/unsubscribe">unsubscribe</a>
</p>`

		// Send an email
		await this.sendEmail(userEmail, subject, textMessage, htmlMessage)
	}

	async sendPasswordRecoveryMessage(userEmail: string, recoveryCode: string) {
		const siteName = this.mainConfig.get().site.name
		const domain = this.mainConfig.get().site.domain

		const subject = 'Password recovery at our web-site'
		const textMessage = 'Password recovery at our web-site'
		const htmlMessage = `
<h1>Password recovery</h1>
<p>To finish password recovery please follow the link below:
  <a href='https://${domain}/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
</p>`

		// Send an email
		await this.sendEmail(userEmail, subject, textMessage, htmlMessage)
	}

	async sendEmail(toEmail: string, subject: string, textMessage: string, htmlMessage: string) {
		const siteName = this.mainConfig.get().site.name
		const domain = this.mainConfig.get().site.domain

		return new Promise((resolve, reject) => {
			/* https://login.sendpulse.com/settings/#api */
			const API_USER_ID = 'b96661c19faf35a7a862d56abbae22c8'
			const API_SECRET = 'ab8cc8878db31680bfacab37e9382933'
			const TOKEN_STORAGE = '/tmp/'

			sendpulse.init(API_USER_ID, API_SECRET, TOKEN_STORAGE, function () {
				const emailOptions = {
					html: htmlMessage,
					text: textMessage,
					subject: subject,
					from: {
						name: 'Andrew Kozinsky',
						email: 'mail@andrewkozinsky.ru',
					},
					to: [
						{
							email: toEmail,
						},
					],
				}

				try {
					sendpulse.smtpSendMail(() => {
						resolve(null)
					}, emailOptions)
				} catch (err) {
					console.log(err)
					reject()
				}
			})
		})
	}
}
