import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { add } from 'date-fns'
import { ServerHelperService } from '@app/server-helper'
import { HashAdapterService } from '@app/hash-adapter'
import { PrismaService } from '../db/prisma.service'
import { CreateUserDtoModel } from '../models/user/user.input.model'
import { UserServiceModel } from '../models/user/user.service.model'
import { UserOutModel } from '../models/user/user.out.model'
import { ApiProperty } from '@nestjs/swagger'

@Injectable()
export class UserQueryRepository {
	constructor(private prisma: PrismaService) {}

	async getUserById(id: number) {
		const user = await this.prisma.user.findUnique({
			where: { id },
		})

		if (!user) {
			return null
		}

		return this.mapDbUserToServiceUser(user)
	}

	mapDbUserToServiceUser(dbUser: User): UserOutModel {
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
			avatar: dbUser.avatar,
		}
	}
}
