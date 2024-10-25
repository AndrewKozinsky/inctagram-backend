import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UserRepository } from '../../repositories/user.repository'
import { EditMyProfileDtoModel } from '../../models/user/user.input.model'
import { UserQueryRepository } from '../../repositories/user.queryRepository'
import { UserOutModel } from '../../models/user/user.out.model'
import {
	ErrorMessage,
	FileMS_EventNames,
	FileMS_GetUserAvatarInContract,
	FileMS_SaveUserAvatarInContract,
	FileMS_SaveUserAvatarOutContract,
} from '@app/shared'
import { lastValueFrom } from 'rxjs'
import { Inject } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'

export class EditMyProfileCommand {
	constructor(
		public userId: number,
		public bodyDto: EditMyProfileDtoModel,
	) {}
}

@CommandHandler(EditMyProfileCommand)
export class EditMyProfileHandler implements ICommandHandler<EditMyProfileCommand> {
	constructor(
		private userRepository: UserRepository,
		private userQueryRepository: UserQueryRepository,
	) {}

	async execute(command: EditMyProfileCommand) {
		const { userId, bodyDto } = command

		// Check user_name property is unique
		const userWithPassesUserName = await this.userRepository.getUserByUserName(bodyDto.userName)
		if (userWithPassesUserName && userWithPassesUserName.id !== userId) {
			throw new Error(ErrorMessage.UserNameIsExists)
		}

		if (bodyDto.dateOfBirth && new Date(bodyDto.dateOfBirth) > new Date()) {
			throw new Error(ErrorMessage.DateIsWrong)
		}

		// Create an object to change user data in DB table
		type UpdateUserSecondArgType = Parameters<typeof this.userRepository.updateUser>[1]
		const updateUserObj: UpdateUserSecondArgType = {
			user_name: bodyDto.userName,
			first_name: bodyDto.firstName,
			last_name: bodyDto.lastName,
			date_of_birth: bodyDto.dateOfBirth ? new Date(bodyDto.dateOfBirth).toISOString() : null,
			country_code: bodyDto.countryCode,
			city_id: bodyDto.cityId,
			about_me: bodyDto.aboutMe,
		}

		await this.userRepository.updateUser(userId, updateUserObj)

		const user = await this.userQueryRepository.getUserById(userId)
		return user as UserOutModel
	}
}
