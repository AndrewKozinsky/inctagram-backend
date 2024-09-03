import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../repositories/user.repository'
import { EmailAdapterService } from '@app/email-adapter'
import { RecoveryPasswordCommand } from './RecoveryPassword.command'
import { ServerHelperService } from '@app/server-helper'

@CommandHandler(RecoveryPasswordCommand)
export class RecoveryPasswordHandler implements ICommandHandler<RecoveryPasswordCommand> {
	constructor(
		private serverHelper: ServerHelperService,
		private userRepository: UserRepository,
		private emailAdapter: EmailAdapterService,
	) {}

	async execute(command: RecoveryPasswordCommand) {
		const { email } = command

		const user = await this.userRepository.getUserByEmail(email)

		// Send success status even if current email is not registered (for prevent user's email detection)
		if (!user) return null

		const recoveryCode = this.serverHelper.strUtils().createUniqString()

		await this.userRepository.updateUser(user.id, { password_recovery_code: recoveryCode })

		await this.emailAdapter.sendPasswordRecoveryMessage(email, recoveryCode)
	}
}
