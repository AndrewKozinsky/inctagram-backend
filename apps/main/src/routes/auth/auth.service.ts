import { Injectable } from '@nestjs/common'
import { MainConfigService } from '@app/config'
import { PrismaService } from '../../prisma.service'
import { Prisma, User } from '@prisma/client'

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private mainConfigService: MainConfigService,
	) {}

	async getUser(userWhereUniqueInput: Prisma.UserWhereUniqueInput): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: userWhereUniqueInput,
		})
	}

	createUser(data: Prisma.UserCreateInput) {
		// console.log(this.mainConfigService.get().db.host)

		return this.prisma.user.create({
			data,
		})
	}
}
