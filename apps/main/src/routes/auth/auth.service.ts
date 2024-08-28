import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../db/prisma.service'
import { Prisma, User } from '@prisma/client'

@Injectable()
export class AuthService {
	constructor(private prisma: PrismaService) {}

	async getUser(userWhereUniqueInput: Prisma.UserWhereUniqueInput): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: userWhereUniqueInput,
		})
	}

	createUser(data: Prisma.UserCreateInput) {
		return this.prisma.user.create({
			data,
		})
	}
}
