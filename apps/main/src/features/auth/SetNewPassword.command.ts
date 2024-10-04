import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../repositories/user.repository'
import { HashAdapterService } from '@app/hash-adapter'
import { ErrorMessage } from '@app/server-helper'

export class SetNewPasswordCommand {
	constructor(
		public readonly recoveryCode: string,
		public readonly newPassword: string,
	) {}
}

@CommandHandler(SetNewPasswordCommand)
export class SetNewPasswordHandler implements ICommandHandler<SetNewPasswordCommand> {
	constructor(
		private userRepository: UserRepository,
		private hashAdapter: HashAdapterService,
	) {}

	async execute(command: SetNewPasswordCommand) {
		const { recoveryCode, newPassword } = command

		const user = await this.userRepository.getUserByPasswordRecoveryCode(recoveryCode)

		if (!user) {
			throw new Error(ErrorMessage.UserNotFound)
		}

		const newHashedPassword = await this.hashAdapter.hashString(newPassword)
		await this.userRepository.updateUser(user.id, {
			password_recovery_code: null,
			hashed_password: newHashedPassword,
		})

		await this.userRepository.updateUser(user.id, { hashed_password: newHashedPassword })
	}
}
