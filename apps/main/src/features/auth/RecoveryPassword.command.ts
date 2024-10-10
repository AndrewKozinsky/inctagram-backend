import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../repositories/user.repository'
import { EmailAdapterService } from '@app/email-adapter'
import { createUniqString } from '@app/shared'
import { ErrorMessage } from '@app/shared'

export class RecoveryPasswordCommand {
	constructor(public readonly email: string) {}
}

@CommandHandler(RecoveryPasswordCommand)
export class RecoveryPasswordHandler
	implements ICommandHandler<RecoveryPasswordCommand, null | { recoveryCode: string }>
{
	constructor(
		private userRepository: UserRepository,
		private emailAdapter: EmailAdapterService,
	) {}

	async execute(command: RecoveryPasswordCommand) {
		const { email } = command

		const user = await this.userRepository.getUserByEmail(email)

		if (!user) {
			throw new Error(ErrorMessage.UserNotFound)
		}

		const recoveryCode = createUniqString()

		await this.userRepository.updateUser(user.id, { password_recovery_code: recoveryCode })

		this.emailAdapter.sendPasswordRecoveryMessage(email, recoveryCode)

		return null
	}
}
