import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../repositories/user.repository'
import { ErrorMessage } from '../../infrastructure/exceptionFilters/layerResult'
import { EmailAdapterService } from '@app/email-adapter'
import { ServerHelperService } from '@app/server-helper'
import { createUniqString } from '../../utils/stringUtils'

export class ResendConfirmationEmailCommand {
	constructor(public readonly email: string) {}
}

@CommandHandler(ResendConfirmationEmailCommand)
export class ResendConfirmationEmailHandler
	implements ICommandHandler<ResendConfirmationEmailCommand>
{
	constructor(
		private userRepository: UserRepository,
		private emailAdapter: EmailAdapterService,
	) {}

	async execute(command: ResendConfirmationEmailCommand) {
		const { email } = command

		const user = await this.userRepository.getUserByEmail(email)

		if (!user) {
			throw new Error(ErrorMessage.EmailNotFound)
		}

		if (!user.isEmailConfirmed) {
			throw new Error(ErrorMessage.EmailIsNotConfirmed)
		}

		const confirmationCode = createUniqString()
		await this.userRepository.updateUser(user.id, {
			email_confirmation_code: confirmationCode,
		})

		this.emailAdapter.sendEmailConfirmationMessage(email, confirmationCode)
	}
}
