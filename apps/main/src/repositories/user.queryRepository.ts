import { Inject, Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { PrismaService } from '../db/prisma.service'
import { UserOutModel } from '../models/user/user.out.model'
import {
	FileMS_EventNames,
	FileMS_GetUserAvatarInContract,
	FileMS_SaveUserAvatarOutContract,
} from '@app/shared'
import { lastValueFrom } from 'rxjs'
import { ClientProxy } from '@nestjs/microservices'

@Injectable()
export class UserQueryRepository {
	constructor(
		private prisma: PrismaService,
		@Inject('FILES_MICROSERVICE') private filesMicroClient: ClientProxy,
	) {}

	async getUsers() {
		const totalUsersCount = await this.prisma.user.count()

		return {
			totalCount: totalUsersCount,
		}
	}

	async getUserById(id: number) {
		const user = await this.prisma.user.findUnique({
			where: { id },
		})

		if (!user) {
			return null
		}

		const userAvatarUrl = await this.getUserAvatarUrl(user.id)

		return this.mapDbUserToServiceUser(user, userAvatarUrl)
	}

	async getUserAvatarUrl(userId: number) {
		const sendingDataContract: FileMS_GetUserAvatarInContract = { userId }
		const filesMSRes: FileMS_SaveUserAvatarOutContract = await lastValueFrom(
			this.filesMicroClient.send(FileMS_EventNames.GetUserAvatar, sendingDataContract),
		)

		return filesMSRes.avatarUrl
	}

	mapDbUserToServiceUser(dbUser: User, userAvatarUrl: null | string): UserOutModel {
		return {
			id: dbUser.id,
			email: dbUser.email,
			userName: dbUser.user_name,
			firstName: dbUser.first_name,
			lastName: dbUser.last_name,
			dateOfBirth: dbUser.date_of_birth,
			countryCode: dbUser.country_code,
			cityId: dbUser.city_id,
			aboutMe: dbUser.about_me,
			avatar: userAvatarUrl,
		}
	}
}
