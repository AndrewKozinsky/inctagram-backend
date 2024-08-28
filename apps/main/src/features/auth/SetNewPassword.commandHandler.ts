import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../repositories/user.repository'
import { SetNewPasswordCommand } from './SetNewPassword.command'
import { LayerErrorCode } from '../../../../../libs/layerResult'
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
			throw new Error(LayerErrorCode.BadRequest_400)
		}

		const newHashedPassword = await this.hashAdapter.hashString(newPassword)
		await this.userRepository.updateUser(user.id, {
			passwordRecoveryCode: null,
			hashedPassword: newHashedPassword,
		})

		await this.userRepository.updateUser(user.id, { hashedPassword: newHashedPassword })
	}
}