import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { add } from 'date-fns'
import { ServerHelperService } from '@app/server-helper'
import { HashAdapterService } from '@app/hash-adapter'
import { PrismaService } from '../db/prisma.service'
import { CreateUserDtoModel } from '../models/user/user.input.model'
import { UserServiceModel } from '../models/user/user.service.model'
import { createUniqString } from '../utils/stringUtils'

@Injectable()
export class UserRepository {
	constructor(
		private prisma: PrismaService,
		private serverHelper: ServerHelperService,
		private hashAdapter: HashAdapterService,
	) {}

	async getUserByEmail(email: string) {
		try {
			const user = await this.prisma.user.findUnique({
				where: { email },
			})

			if (!user) return null

			return this.mapDbUserToServiceUser(user)
		} catch (err: unknown) {
			console.log(err)
		}
	}

	async getUserByEmailOrName(email: string, name: string) {
		try {
			const user = await this.prisma.user.findFirst({
				where: {
					OR: [{ email }, { name }],
				},
			})

			if (!user) return null

			return this.mapDbUserToServiceUser(user)
		} catch (err: unknown) {
			console.log(err)
		}
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

	async getUserByEmailAndPassword(email: string, password: string) {
		const user = await this.prisma.user.findUnique({
			where: { email },
		})
		if (!user) return null

		const isPasswordMath = await this.hashAdapter.compare(password, user.hashed_password)
		if (!isPasswordMath) return null

		return this.mapDbUserToServiceUser(user)
	}

	async getUserByConfirmationCode(confirmationCode: string) {
		const user = await this.prisma.user.findFirst({
			where: { email_confirmation_code: confirmationCode },
		})

		if (!user) return null

		return this.mapDbUserToServiceUser(user)
	}

	async getConfirmedUserByEmailAndPassword(
		email: string,
		password: string,
	): Promise<null | UserServiceModel> {
		const user = await this.getUserByEmailAndPassword(email, password)

		if (!user || !user.isEmailConfirmed) {
			return null
		}

		return user
	}

	async getUserByPasswordRecoveryCode(password_recovery_code: string) {
		const user = await this.prisma.user.findFirst({
			where: { password_recovery_code },
		})

		if (!user) return null

		return this.mapDbUserToServiceUser(user)
	}

	async createUser(dto: CreateUserDtoModel, isEmailConfirmed?: boolean) {
		const newUserParams = {
			email: dto.email,
			name: dto.name,
			hashed_password: '',
			email_confirmation_code: '',
			email_confirmation_code_expiration_date: '',
			is_email_confirmed: true,
		}

		if (!isEmailConfirmed) {
			newUserParams.email_confirmation_code = createUniqString()
			newUserParams.email_confirmation_code_expiration_date = add(new Date(), {
				hours: 0,
				minutes: 5,
			}).toISOString()

			newUserParams.hashed_password = await this.hashAdapter.hashString(dto.password)
			newUserParams.is_email_confirmed = false
		}

		const user = await this.prisma.user.create({
			data: newUserParams,
		})

		return this.mapDbUserToServiceUser(user)
	}

	async updateUser(userId: number, data: Partial<User>) {
		await this.prisma.user.update({
			where: { id: userId },
			data,
		})
	}

	async makeEmailVerified(userId: number) {
		await this.updateUser(userId, {
			email_confirmation_code: null,
			is_email_confirmed: true,
			email_confirmation_code_expiration_date: null,
		})
	}

	async deleteUser(userId: number) {
		await this.prisma.user.delete({
			where: { id: userId },
		})
	}

	mapDbUserToServiceUser(dbUser: User): UserServiceModel {
		return {
			id: dbUser.id,
			email: dbUser.email,
			name: dbUser.name,
			hashedPassword: dbUser.hashed_password,
			emailConfirmationCode: dbUser.email_confirmation_code,
			confirmationCodeExpirationDate: dbUser.email_confirmation_code_expiration_date,
			isEmailConfirmed: dbUser.is_email_confirmed,
			passwordRecoveryCode: dbUser.password_recovery_code,
		}
	}
}
