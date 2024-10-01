import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../repositories/user.repository'
import { ErrorMessage } from '../../infrastructure/exceptionFilters/layerResult'
import { EditMyProfileDtoModel } from '../../models/user/user.input.model'

export class EditMyProfileCommand {
	constructor(
		public userId: number,
		public bodyDto: EditMyProfileDtoModel,
	) {}
}

@CommandHandler(EditMyProfileCommand)
export class EditMyProfileHandler implements ICommandHandler<EditMyProfileCommand> {
	constructor(private userRepository: UserRepository) {}

	async execute(command: EditMyProfileCommand) {
		const { userId, bodyDto } = command

		// Check user_name property is unique
		const userWithPassesUserName = await this.userRepository.getUserByUserName(bodyDto.userName)
		if (userWithPassesUserName) {
			throw new Error(ErrorMessage.UserNameIsExists)
		}

		// Create an object to change user data in DB table
		type UpdateUserSecondArgType = Parameters<typeof this.userRepository.updateUser>[1]
		const updateUserObj: UpdateUserSecondArgType = {
			user_name: bodyDto.userName,
			first_name: bodyDto.firstName,
			last_name: bodyDto.userName,
			// dateOfBirth: bodyDto.userName,
			country_code: bodyDto.countryCode,
			city_id: bodyDto.cityId,
			about_me: bodyDto.aboutMe,
		}

		await this.userRepository.updateUser(userId, updateUserObj)

		return {
			id: 0,
			email: '0',
			user_name: 'string',
			first_name: null,
			last_name: null,
			avatar: null,
			date_of_birth: null,
			country_code: null,
			city_id: null,
			about_me: null,
		}
	}
}
