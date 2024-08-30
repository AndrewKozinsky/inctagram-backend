import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../repositories/user.repository'
import { ErrorCode } from '../../../../../libs/layerResult'
import { ConfirmEmailCommand } from './ConfirmEmail.command'
import { CustomException } from '../../utils/misc'

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailHandler implements ICommandHandler<ConfirmEmailCommand> {
	constructor(private userRepository: UserRepository) {}

	async execute(command: ConfirmEmailCommand) {
		const { confirmationCode } = command

		const user = await this.userRepository.getUserByConfirmationCode(confirmationCode)
		if (!user || user.isEmailConfirmed) {
			throw CustomException(ErrorCode.BadRequest_400)
		}

		if (
			user.emailConfirmationCode !== confirmationCode ||
			new Date(user.confirmationCodeExpirationDate!) < new Date()
		) {
			throw CustomException(ErrorCode.BadRequest_400)
		}

		await this.userRepository.updateUser(user.id, { isEmailConfirmed: true })
	}
}
