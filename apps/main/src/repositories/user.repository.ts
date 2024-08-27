import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { add } from 'date-fns'
import { ServerHelperService } from '@app/server-helper'
import { HashAdapterService } from '@app/hash-adapter'
import { PrismaService } from '../prisma.service'
import { CreateUserDtoModel } from '../models/user/user.input.model'
import { UserServiceModel } from '../models/user/user.service.model'

@Injectable()
export class UserRepository {
	constructor(
		private prisma: PrismaService,
		private serverHelper: ServerHelperService,
		private hashAdapter: HashAdapterService,
	) {}

	async getUserByEmail(email: string) {
		const user = await this.prisma.user.findUnique({
			where: { email },
		})

		if (!user) {
			return null
		}

		return this.mapDbUserToServiceUser(user)
	}

	async getUserById(id: number) {
		const user = await this.prisma.user.findUnique({
			where: { id },
		})

		if (!user) {
			return null
		}

		return this.mapDbUserToServiceUser(user)
	}

	async createUser(dto: CreateUserDtoModel, isEmailConfirmed?: boolean) {
		const newUserParams = {
			email: dto.email,
			name: dto.name,
			hashedPassword: '',
			emailConfirmationCode: '',
			emailConfirmationCodeExpirationDate: '',
			isEmailConfirmed: true,
		}

		if (!isEmailConfirmed) {
			newUserParams.emailConfirmationCode = this.serverHelper.strUtils().createUniqString()
			newUserParams.emailConfirmationCodeExpirationDate = add(new Date(), {
				hours: 0,
				minutes: 5,
			}).toISOString()
			const passwordHash = await this.hashAdapter.hashString(dto.password)
			newUserParams.isEmailConfirmed = true
		}

		const user = await this.prisma.user.create({
			data: newUserParams,
		})

		return this.mapDbUserToServiceUser(user)
	}

	mapDbUserToServiceUser(dbUser: User): UserServiceModel {
		return {
			id: dbUser.id,
			email: dbUser.email,
			name: dbUser.name,
			hashedPassword: dbUser.hashedPassword,
			emailConfirmationCode: dbUser.emailConfirmationCode,
			confirmationCodeExpirationDate: dbUser.emailConfirmationCodeExpirationDate,
			isConfirmationEmailCodeConfirmed: dbUser.isEmailConfirmed,
			passwordRecoveryCode: dbUser.passwordRecoveryCode,
		}
	}
}
