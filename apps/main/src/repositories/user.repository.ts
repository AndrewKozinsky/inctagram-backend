import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { add } from 'date-fns'
import { ServerHelperService } from '@app/server-helper'
import { HashAdapterService } from '@app/hash-adapter'
import { PrismaService } from '../db/prisma.service'
import { CreateUserDtoModel } from '../models/user/user.input.model'
import { UserServiceModel } from '../models/user/user.service.model'
import { createUniqString } from '../utils/stringUtils'
import { JwtAdapterService } from '@app/jwt-adapter'

@Injectable()
export class UserRepository {
	constructor(
		private prisma: PrismaService,
		private hashAdapter: HashAdapterService,
		private jwtAdapter: JwtAdapterService,
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

	async getUserByEmailOrName(args: { email?: string; name?: string }) {
		try {
			const user = await this.prisma.user.findFirst({
				where: {
					OR: [{ email: args.email }, { name: args.name }],
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

	async getUserByRefreshToken(refreshTokenStr: string) {
		const refreshTokenData = this.jwtAdapter.getRefreshTokenDataFromTokenStr(refreshTokenStr)

		const device = await this.prisma.deviceToken.findFirst({
			where: { device_id: refreshTokenData!.deviceId },
		})

		if (!device) return null

		const user = await this.prisma.user.findFirst({
			where: { id: device.user_id },
		})

		if (!user) return null

		return this.mapDbUserToServiceUser(user)
	}

	async createUser(
		dto: CreateUserDtoModel & { githubId?: number; googleId?: number },
		isEmailConfirmed = false,
	) {
		let isConfirmed = isEmailConfirmed

		const newUserParams: any = {
			email: dto.email,
			name: dto.name,
			hashed_password: await this.hashAdapter.hashString(dto.password),
			email_confirmation_code: createUniqString(),
			email_confirmation_code_expiration_date: add(new Date(), {
				hours: 0,
				minutes: 5,
			}).toISOString(),
			is_email_confirmed: false,
		}

		if (dto.githubId) {
			newUserParams.github_id = dto.githubId
			isConfirmed = true
		}
		if (dto.googleId) {
			newUserParams.google_id = dto.googleId
			isConfirmed = true
		}

		if (isConfirmed) {
			newUserParams.email_confirmation_code = null
			newUserParams.email_confirmation_code_expiration_date = null
			newUserParams.is_email_confirmed = true
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
			avatar: dbUser.avatar,
			hashedPassword: dbUser.hashed_password,
			emailConfirmationCode: dbUser.email_confirmation_code,
			confirmationCodeExpirationDate: dbUser.email_confirmation_code_expiration_date,
			isEmailConfirmed: dbUser.is_email_confirmed,
			passwordRecoveryCode: dbUser.password_recovery_code,
			githubId: dbUser.github_id,
			googleId: dbUser.google_id,
		}
	}
}
