import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../repositories/user.repository'
import { EmailAdapterService } from '@app/email-adapter'
import { ServerHelperService } from '@app/server-helper'
import { createUniqString } from '../../utils/stringUtils'
import { ErrorMessage } from '../../infrastructure/exceptionFilters/layerResult'

export class RecoveryPasswordCommand {
	constructor(public readonly email: string) {}
}

@CommandHandler(RecoveryPasswordCommand)
export class RecoveryPasswordHandler
	implements ICommandHandler<RecoveryPasswordCommand, null | { recoveryCode: string }>
{
	constructor(
		private serverHelper: ServerHelperService,
		private userRepository: UserRepository,
		private emailAdapter: EmailAdapterService,
	) {}

	async execute(command: RecoveryPasswordCommand) {
		const { email } = command

		const user = await this.userRepository.getUserByEmail(email)

		// Send success status even if current email is not registered (for prevent user's email detection)
		if (!user) {
			throw new Error(ErrorMessage.UserNotFound)
		}

		const recoveryCode = createUniqString()

		await this.userRepository.updateUser(user.id, { password_recovery_code: recoveryCode })

		this.emailAdapter.sendPasswordRecoveryMessage(email, recoveryCode)

		return { recoveryCode }
	}
}
