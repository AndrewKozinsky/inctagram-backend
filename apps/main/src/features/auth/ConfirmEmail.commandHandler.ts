import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../repositories/user.repository'
import { LayerErrorCode } from '../../../../../libs/layerResult'
import { EmailAdapterService } from '@app/email-adapter'
import { LoginCommand } from './Login.command'
import { JwtAdapterService } from '@app/jwt-adapter'
import { AuthRepository } from '../../repositories/auth.repository'
import { ConfirmEmailCommand } from './ConfirmEmail.command'

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailHandler implements ICommandHandler<ConfirmEmailCommand> {
	constructor(private userRepository: UserRepository) {}

	async execute(command: ConfirmEmailCommand) {
		const { confirmationCode } = command

		const user = await this.userRepository.getUserByConfirmationCode(confirmationCode)
		if (!user || user.isEmailConfirmed) {
			throw new Error(LayerErrorCode.BadRequest_400)
		}

		if (
			user.emailConfirmationCode !== confirmationCode ||
			new Date(user.confirmationCodeExpirationDate!) < new Date()
		) {
			throw new Error(LayerErrorCode.BadRequest_400)
		}

		await this.userRepository.makeUserEmailConfirmed(user.id)
	}
}
