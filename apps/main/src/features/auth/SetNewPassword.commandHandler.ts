import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../repositories/user.repository'
import { SetNewPasswordCommand } from './SetNewPassword.command'
import { ErrorCode } from '../../../../../libs/layerResult'
import { HashAdapterService } from '@app/hash-adapter'

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
			// !!!!!!
			throw new Error(ErrorCode.BadRequest_400)
		}

		const newHashedPassword = await this.hashAdapter.hashString(newPassword)
		await this.userRepository.updateUser(user.id, {
			password_recovery_code: null,
			hashed_password: newHashedPassword,
		})

		await this.userRepository.updateUser(user.id, { hashed_password: newHashedPassword })
	}
}
