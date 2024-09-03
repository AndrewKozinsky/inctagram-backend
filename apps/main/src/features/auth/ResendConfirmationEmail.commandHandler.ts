import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../repositories/user.repository'
import { ErrorCode } from '../../../../../libs/layerResult'
import { EmailAdapterService } from '@app/email-adapter'
import { ResendConfirmationEmailCommand } from './ResendConfirmationEmail.command'
import { ServerHelperService } from '@app/server-helper'

@CommandHandler(ResendConfirmationEmailCommand)
export class ResendConfirmationEmailHandler
	implements ICommandHandler<ResendConfirmationEmailCommand>
{
	constructor(
		private userRepository: UserRepository,
		private emailAdapter: EmailAdapterService,
		private serverHelper: ServerHelperService,
	) {}

	async execute(command: ResendConfirmationEmailCommand) {
		const { email } = command

		const user = await this.userRepository.getUserByEmail(email)

		if (!user || user.isEmailConfirmed) {
			// !!!!!!
			throw new Error(ErrorCode.BadRequest_400)
		}

		const confirmationCode = this.serverHelper.strUtils().createUniqString()
		const newConfirmationCode = await this.userRepository.updateUser(user.id, {
			email_confirmation_code: confirmationCode,
		})

		this.emailAdapter.sendEmailConfirmationMessage(email, confirmationCode)
	}
}
