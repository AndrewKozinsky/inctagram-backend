import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../repositories/user.repository'
import { ErrorMessage } from '@app/server-helper'

export class ConfirmEmailCommand {
	constructor(public readonly confirmationCode: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailHandler implements ICommandHandler<ConfirmEmailCommand> {
	constructor(private userRepository: UserRepository) {}

	async execute(command: ConfirmEmailCommand) {
		const { confirmationCode } = command

		const user = await this.userRepository.getUserByConfirmationCode(confirmationCode)
		if (!user) {
			throw new Error(ErrorMessage.EmailConfirmationCodeNotFound)
		}

		if (new Date(user.confirmationCodeExpirationDate!) < new Date()) {
			throw new Error(ErrorMessage.EmailConfirmationCodeIsExpired)
		}

		await this.userRepository.makeEmailVerified(user.id)
	}
}
